import EmergencyAccess from '../models/EmergencyAccess.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import SecurityAlert from '../models/SecurityAlert.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Initiates audited time-limited (4-hour) emergency break-glass record access (Section 27)
 */
export async function createEmergencyAccess(req, res, next) {
  try {
    const { patientId, reason, category = 'UNCONSCIOUS_PATIENT' } = req.body;

    if (!patientId || !reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A valid patient and thorough clinical justification (minimum 10 characters) are strictly required.'
      });
    }

    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only registered clinicians or hospital administrators can invoke emergency break-glass protocol.'
      });
    }

    const patient = await Patient.findById(patientId).populate('userId', 'name email');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Emergency patient not found.' });
    }

    // Standard 4-Hour Emergency Window
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 4 * 60 * 60 * 1000);

    const emergencySession = await EmergencyAccess.create({
      doctorId: doctorProfile?._id || req.user._id,
      patientId: patient._id,
      reason: reason.trim(),
      status: 'ACTIVE',
      startedAt,
      expiresAt,
      documentsAccessed: []
    });

    // 1. Mandatory Audit Logging with High Visibility (Section 26 & 27)
    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: patient._id,
      action: 'BREAK_GLASS_ACCESS',
      resourceType: 'EMERGENCY_ACCESS',
      resourceId: emergencySession._id.toString(),
      status: 'SUCCESS',
      metadata: {
        reason: reason.trim(),
        category,
        patientName: patient.userId?.name,
        patientMRN: patient.mrn,
        expiresAt
      }
    });

    // 2. Immediate Notification to the Patient (Access Transparency)
    if (patient.userId?._id) {
      await createNotification({
        userId: patient.userId._id,
        title: 'EMERGENCY BREAK-GLASS RECORD ACCESS',
        message: `Clinician ${req.user.name} declared 4-hour emergency access to your medical records. Reason: "${reason.trim()}".`,
        type: 'EMERGENCY_ACCESS',
        link: '/patient/dashboard'
      });
    }

    // 3. High-Priority Alert to System Administrators & Security Officers
    const admins = await User.find({ role: { $in: ['ADMIN', 'AUDITOR'] } });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        title: 'HIGH ALERT: Emergency Break-Glass Declared',
        message: `Dr. ${req.user.name} invoked emergency break-glass for Patient ${patient.userId?.name || patient.mrn}. Justification: "${reason.trim()}".`,
        type: 'EMERGENCY_ACCESS',
        link: '/audit-trail'
      });
    }

    // 4. Create Security Alert Record (Section 31 & 32)
    await SecurityAlert.create({
      userId: req.user._id,
      type: 'SUSPICIOUS_EMERGENCY_ACCESS',
      severity: 'HIGH',
      description: `Emergency break-glass invoked by Dr. ${req.user.name} for Patient ${patient.mrn}. Category: ${category}.`,
      count: 1,
      timePeriod: 'Immediate',
      status: 'OPEN',
      metadata: {
        sessionId: emergencySession._id,
        patientId: patient._id,
        reason
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency break-glass access authorized for 4 hours. All interactions are being audited.',
      session: emergencySession
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns currently active break-glass sessions
 */
export async function getActiveSessions(req, res, next) {
  try {
    const query = {
      status: 'ACTIVE',
      expiresAt: { $gt: new Date() }
    };

    if (req.user.role === 'DOCTOR') {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (doctorProfile) {
        query.doctorId = doctorProfile._id;
      }
    }

    const sessions = await EmergencyAccess.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ startedAt: -1 });

    return res.json({
      success: true,
      sessions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Prematurely terminates an active emergency session
 */
export async function endEmergencySession(req, res, next) {
  try {
    const { id } = req.params;
    const session = await EmergencyAccess.findById(id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Emergency session not found.' });
    }

    session.status = 'REVOKED';
    await session.save();

    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: session.patientId,
      action: 'BREAK_GLASS_REVOKED',
      resourceType: 'EMERGENCY_ACCESS',
      resourceId: session._id.toString(),
      status: 'SUCCESS',
      metadata: { sessionEndedAt: new Date() }
    });

    return res.json({
      success: true,
      message: 'Emergency break-glass session ended.',
      session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns history of all break-glass events (Admin/Auditor)
 */
export async function getEmergencyHistory(req, res, next) {
  try {
    const history = await EmergencyAccess.find()
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ startedAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
}
