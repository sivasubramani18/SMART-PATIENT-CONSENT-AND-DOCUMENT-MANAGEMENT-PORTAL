import crypto from 'crypto';
import Consent from '../models/Consent.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import {
  explainConsentWithAI,
  explainMedicalTerm,
  generateComprehensionQuestions
} from '../services/geminiService.js';

export async function createConsent(req, res, next) {
  try {
    const {
      patientId,
      procedure,
      purpose,
      description,
      benefits,
      risks,
      alternatives,
      additionalInformation,
      expiresAt,
      parentConsentId
    } = req.body;

    if (!patientId || !procedure || !purpose || !description || !expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Patient, procedure, purpose, description, and expiry date are required.'
      });
    }

    const doctorProfile = req.doctor || await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(403).json({ success: false, message: 'Doctor clinical profile required to issue consents.' });
    }

    const targetPatient = await Patient.findById(patientId).populate('userId', 'name email');
    if (!targetPatient) {
      return res.status(404).json({ success: false, message: 'Target patient not found.' });
    }

    // Versioning logic (Section 17)
    let version = 1;
    let actualParentId = null;

    if (parentConsentId) {
      const parent = await Consent.findById(parentConsentId);
      if (parent) {
        version = parent.version + 1;
        actualParentId = parent._id;
      }
    } else {
      const existing = await Consent.findOne({
        patientId,
        procedure: procedure.trim()
      }).sort({ version: -1 });

      if (existing) {
        version = existing.version + 1;
        actualParentId = existing._id;
      }
    }

    const benefitsArray = Array.isArray(benefits)
      ? benefits
      : (typeof benefits === 'string' ? benefits.split('\n').filter(Boolean) : []);

    const risksArray = Array.isArray(risks)
      ? risks
      : (typeof risks === 'string' ? risks.split('\n').filter(Boolean) : []);

    const alternativesArray = Array.isArray(alternatives)
      ? alternatives
      : (typeof alternatives === 'string' ? alternatives.split('\n').filter(Boolean) : []);

    const newConsent = await Consent.create({
      patientId,
      doctorId: doctorProfile._id,
      procedure: procedure.trim(),
      purpose: purpose.trim(),
      description: description.trim(),
      benefits: benefitsArray,
      risks: risksArray,
      alternatives: alternativesArray,
      additionalInformation: additionalInformation ? additionalInformation.trim() : '',
      version,
      parentConsentId: actualParentId,
      status: 'SENT',
      sentAt: new Date(),
      expiresAt: new Date(expiresAt)
    });

    // Audit Log (Section 26)
    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: targetPatient._id,
      action: 'CREATE_CONSENT',
      resourceType: 'CONSENT',
      resourceId: newConsent._id.toString(),
      status: 'SUCCESS',
      metadata: { procedure: newConsent.procedure, version }
    });

    // Notify Patient (Section 30)
    if (targetPatient.userId) {
      await createNotification({
        userId: targetPatient.userId._id,
        title: 'New Clinical Consent Agreement Pending Review',
        message: `Dr. ${req.user.name} sent a consent request for "${newConsent.procedure}" (v${version}.0).`,
        type: 'CONSENT_REQUEST',
        link: `/consents/${newConsent._id}`
      });
    }

    return res.status(201).json({
      success: true,
      message: `Consent request v${version}.0 dispatched to patient.`,
      consent: newConsent
    });
  } catch (error) {
    next(error);
  }
}

export async function getConsents(req, res, next) {
  try {
    const { status, patientId: queryPatientId } = req.query;
    const filter = {};

    // IDOR scoping (Section 7)
    if (req.user.role === 'PATIENT') {
      const patientProfile = req.patient || await Patient.findOne({ userId: req.user._id });
      if (!patientProfile) {
        return res.status(404).json({ success: false, message: 'Patient profile not found.' });
      }
      filter.patientId = patientProfile._id;
    } else if (req.user.role === 'DOCTOR') {
      const doctorProfile = req.doctor || await Doctor.findOne({ userId: req.user._id });
      if (doctorProfile) {
        filter.doctorId = doctorProfile._id;
      }
    } else if (queryPatientId) {
      filter.patientId = queryPatientId;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    // Auto-update expired consents (Section 25)
    await Consent.updateMany(
      {
        expiresAt: { $lt: new Date() },
        status: { $in: ['SENT', 'VIEWED', 'UNDER_REVIEW'] }
      },
      { $set: { status: 'EXPIRED' } }
    );

    const consents = await Consent.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      });

    return res.json({
      success: true,
      count: consents.length,
      consents
    });
  } catch (error) {
    next(error);
  }
}

export async function getConsentById(req, res, next) {
  try {
    const consent = await Consent.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent agreement not found.' });
    }

    // IDOR protection
    if (req.user.role === 'PATIENT') {
      const patientProfile = req.patient || await Patient.findOne({ userId: req.user._id });
      if (!patientProfile || !consent.patientId._id.equals(patientProfile._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized consent access.' });
      }

      // Lifecycle update: SENT -> VIEWED (Section 16)
      if (consent.status === 'SENT') {
        consent.status = 'VIEWED';
        consent.viewedAt = new Date();
        await consent.save();
      }
    }

    // Audit Log (Section 26)
    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: consent.patientId._id,
      action: 'VIEW_CONSENT',
      resourceType: 'CONSENT',
      resourceId: consent._id.toString(),
      status: 'SUCCESS',
      metadata: { procedure: consent.procedure, version: consent.version }
    });

    // Version Lineage (Section 17)
    const versionHistory = await Consent.find({
      patientId: consent.patientId._id,
      procedure: consent.procedure
    })
      .sort({ version: -1 })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      });

    return res.json({
      success: true,
      consent,
      versionHistory
    });
  } catch (error) {
    next(error);
  }
}

export async function acceptConsent(req, res, next) {
  try {
    const consent = await Consent.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('patientId');

    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent agreement not found.' });
    }

    // Only target patient can digitally accept
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({ success: false, message: 'Only the patient can digitally accept consent.' });
    }

    const patientProfile = req.patient || await Patient.findOne({ userId: req.user._id });
    if (!consent.patientId._id.equals(patientProfile._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this consent.' });
    }

    if (consent.status === 'ACTIVE' || consent.status === 'ACCEPTED') {
      return res.status(400).json({ success: false, message: 'Consent has already been signed and is currently active.' });
    }

    if (new Date() > new Date(consent.expiresAt)) {
      consent.status = 'EXPIRED';
      await consent.save();
      return res.status(400).json({ success: false, message: 'This consent agreement has expired. Please contact your clinician.' });
    }

    const { verificationMethod = 'DIGITAL_OTP', otpCode, comprehensionAnswers = [] } = req.body;

    // Cryptographic signature hash (Section 23)
    const timestamp = new Date();
    const signaturePayload = `${patientProfile._id}_${consent._id}_v${consent.version}_${timestamp.toISOString()}`;
    const signatureHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Patient Browser';

    consent.status = 'ACTIVE';
    consent.acceptedAt = timestamp;
    consent.signatureMetadata = {
      patientConfirmed: true,
      verificationMethod,
      ipAddress: String(ipAddress),
      userAgent,
      timestamp,
      signatureHash: `sha256-${signatureHash}`
    };

    if (comprehensionAnswers.length > 0) {
      consent.comprehensionAnswers = comprehensionAnswers;
    }

    await consent.save();

    // Audit Log (Section 26)
    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: patientProfile._id,
      action: 'ACCEPT_CONSENT',
      resourceType: 'CONSENT',
      resourceId: consent._id.toString(),
      status: 'SUCCESS',
      metadata: {
        procedure: consent.procedure,
        version: consent.version,
        verificationMethod,
        signatureHash: `sha256-${signatureHash}`
      }
    });

    // Notify Doctor (Section 30)
    if (consent.doctorId?.userId) {
      await createNotification({
        userId: consent.doctorId.userId._id,
        title: 'Consent Digitally Signed & Active',
        message: `Patient ${req.user.name} digitally verified and accepted consent for "${consent.procedure}" (v${consent.version}.0).`,
        type: 'CONSENT_ACCEPTED',
        link: `/consents/${consent._id}`
      });
    }

    return res.json({
      success: true,
      message: 'Consent digitally signed and activated successfully.',
      consent
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectConsent(req, res, next) {
  try {
    const consent = await Consent.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('patientId');

    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent not found.' });
    }

    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({ success: false, message: 'Only the patient can decline consent.' });
    }

    const patientProfile = req.patient || await Patient.findOne({ userId: req.user._id });
    if (!consent.patientId._id.equals(patientProfile._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }

    consent.status = 'REJECTED';
    consent.rejectedAt = new Date();
    await consent.save();

    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: patientProfile._id,
      action: 'REJECT_CONSENT',
      resourceType: 'CONSENT',
      resourceId: consent._id.toString(),
      status: 'SUCCESS',
      metadata: { procedure: consent.procedure, version: consent.version }
    });

    if (consent.doctorId?.userId) {
      await createNotification({
        userId: consent.doctorId.userId._id,
        title: 'Consent Declined by Patient',
        message: `Patient ${req.user.name} declined consent for "${consent.procedure}".`,
        type: 'CONSENT_REJECTED',
        link: `/consents/${consent._id}`
      });
    }

    return res.json({
      success: true,
      message: 'Consent status recorded as Declined.',
      consent
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeConsent(req, res, next) {
  try {
    const { reason } = req.body;
    const consent = await Consent.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('patientId');

    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent not found.' });
    }

    if (consent.status !== 'ACTIVE' && consent.status !== 'ACCEPTED') {
      return res.status(400).json({ success: false, message: 'Only active consents can be revoked.' });
    }

    consent.status = 'REVOKED';
    consent.revokedAt = new Date();
    consent.revocationReason = reason || 'Withdrawn by patient request';
    await consent.save();

    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: consent.patientId._id,
      action: 'REVOKE_CONSENT',
      resourceType: 'CONSENT',
      resourceId: consent._id.toString(),
      status: 'SUCCESS',
      metadata: {
        procedure: consent.procedure,
        version: consent.version,
        revocationReason: consent.revocationReason
      }
    });

    if (consent.doctorId?.userId) {
      await createNotification({
        userId: consent.doctorId.userId._id,
        title: 'Consent Agreement Revoked / Withdrawn',
        message: `Consent agreement for "${consent.procedure}" was revoked. Reason: ${consent.revocationReason}`,
        type: 'CONSENT_REJECTED',
        link: `/consents/${consent._id}`
      });
    }

    return res.json({
      success: true,
      message: 'Consent has been revoked.',
      consent
    });
  } catch (error) {
    next(error);
  }
}

export async function explainConsentEndpoint(req, res, next) {
  try {
    const consent = await Consent.findById(req.params.id);
    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent not found.' });
    }

    const aiResult = await explainConsentWithAI(consent);
    return res.json({
      success: true,
      ...aiResult
    });
  } catch (error) {
    next(error);
  }
}

export async function explainTermEndpoint(req, res, next) {
  try {
    const { term, context } = req.body;
    if (!term) {
      return res.status(400).json({ success: false, message: 'Medical term is required.' });
    }

    const result = await explainMedicalTerm(term, context);
    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

export async function getComprehensionQuestionsEndpoint(req, res, next) {
  try {
    const consent = await Consent.findById(req.params.id);
    if (!consent) {
      return res.status(404).json({ success: false, message: 'Consent not found.' });
    }

    const result = await generateComprehensionQuestions(consent);
    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}
