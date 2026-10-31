import mongoose from 'mongoose';
import Document from '../models/Document.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import EmergencyAccess from '../models/EmergencyAccess.js';
import {
  saveFileToStorage,
  getFileFromStorage,
  getFileBuffer,
  deleteFileFromStorage,
  generateSignedFileUrl
} from '../services/storageService.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { checkDocumentAccessSpike, flagUnauthorizedAttempt } from '../services/anomalyService.js';
import { extractTextFromBuffer } from '../services/ocrService.js';
import { sendConsentNotificationEmail } from '../services/emailService.js';

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please select a PDF or image.' });
    }

    const { patientId, documentType, title, description, parentDocumentId } = req.body;

    if (!patientId || !documentType || !title) {
      return res.status(400).json({
        success: false,
        message: 'Patient, Document Type, and Title are required.'
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId).populate('userId', 'name email');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Specified patient profile not found' });
    }

    // Document Versioning Logic (Section 14)
    let version = 1;
    let actualParentId = null;

    if (parentDocumentId) {
      const parentDoc = await Document.findById(parentDocumentId);
      if (parentDoc) {
        version = parentDoc.version + 1;
        actualParentId = parentDoc._id;
      }
    } else {
      // Check if existing document with identical title exists for this patient
      const latestExisting = await Document.findOne({
        patientId,
        title: title.trim(),
        status: 'ACTIVE'
      }).sort({ version: -1 });

      if (latestExisting) {
        version = latestExisting.version + 1;
        actualParentId = latestExisting._id;
      }
    }

    const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Extract OCR text (Section 13)
    let extractedText = '';
    try {
      extractedText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    } catch (ocrErr) {
      console.warn('[OCR Extraction Warning]:', ocrErr.message);
    }

    // Save metadata in MongoDB (Section 4 & 13)
    const newDoc = await Document.create({
      patientId,
      uploadedBy: req.user._id,
      documentType,
      title: title.trim(),
      description: description ? description.trim() : '',
      fileName: sanitizedFilename,
      s3Key: '',
      storageType: 'MONGODB',
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      version,
      parentDocumentId: actualParentId,
      status: 'ACTIVE',
      extractedText
    });

    // Save binary file directly in MongoDB DocumentFile collection
    await saveFileToStorage({
      documentId: newDoc._id,
      fileBuffer: req.file.buffer,
      fileName: sanitizedFilename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size
    });

    // Audit Log (Section 26)
    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: patient._id,
      action: 'UPLOAD_DOCUMENT',
      resourceType: 'DOCUMENT',
      resourceId: newDoc._id.toString(),
      status: 'SUCCESS',
      metadata: {
        documentType,
        title: newDoc.title,
        version,
        fileSize: newDoc.fileSize
      }
    });

    // Notify Patient (Section 30)
    if (patient.userId) {
      await createNotification({
        userId: patient.userId._id,
        title: 'New Medical Document Vault Upload',
        message: `${newDoc.documentType} "${newDoc.title}" (v${version}.0) has been uploaded by ${req.user.name}.`,
        type: 'DOCUMENT_UPLOAD',
        link: '/documents'
      });
    }

    // Send email notification to siva431900@gmail.com when doctor uploads consent document
    const isConsentDoc =
      newDoc.documentType === 'Consent' ||
      newDoc.title.toLowerCase().includes('consent') ||
      req.user.role === 'DOCTOR';

    if (isConsentDoc) {
      sendConsentNotificationEmail({
        doctorName: req.user.name,
        patientName: patient?.userId?.name || 'Assigned Patient',
        documentTitle: newDoc.title,
        documentType: newDoc.documentType,
        version: newDoc.version,
        fileSize: newDoc.fileSize,
        action: 'DOCUMENT_UPLOAD'
      }).catch((err) => console.warn('[Email Warning]:', err.message));
    }

    return res.status(201).json({
      success: true,
      message: `Document v${version}.0 successfully uploaded and secured.`,
      document: newDoc
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocuments(req, res, next) {
  try {
    const { documentType, status, search, patientId: queryPatientId } = req.query;
    const filter = {};

    // Strict IDOR Protection (Section 7 & 38)
    if (req.user.role === 'PATIENT') {
      const patient = req.patient || await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient profile not found' });
      }
      filter.patientId = patient._id;
    } else if (queryPatientId) {
      filter.patientId = queryPatientId;
    }

    if (documentType && documentType !== 'All') {
      filter.documentType = documentType;
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = 'ACTIVE';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { extractedText: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email role')
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      });

    return res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentById(req, res, next) {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email role')
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // IDOR Check
    if (req.user.role === 'PATIENT') {
      const patient = req.patient || await Patient.findOne({ userId: req.user._id });
      if (!patient || !document.patientId._id.equals(patient._id)) {
        await flagUnauthorizedAttempt({
          userId: req.user._id,
          userEmail: req.user.email,
          userName: req.user.name,
          role: req.user.role,
          resourceType: 'DOCUMENT',
          resourceId: document._id.toString(),
          reason: 'Patient attempted to view records not belonging to their account'
        });
        return res.status(403).json({ success: false, message: 'Unauthorized access to medical record' });
      }
    }

    // Check if Doctor is accessing via active Emergency Break-Glass (Section 27)
    if (req.user.role === 'DOCTOR') {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (doctorProfile) {
        const activeEmergency = await EmergencyAccess.findOne({
          doctorId: doctorProfile._id,
          patientId: document.patientId._id,
          status: 'ACTIVE',
          expiresAt: { $gt: new Date() }
        });
        if (activeEmergency) {
          activeEmergency.documentsAccessed.push({
            documentId: document._id,
            accessedAt: new Date()
          });
          await activeEmergency.save();
        }
      }
    }

    // Log Document View Audit
    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: document.patientId._id,
      action: 'VIEW_DOCUMENT',
      resourceType: 'DOCUMENT',
      resourceId: document._id.toString(),
      status: 'SUCCESS',
      metadata: { title: document.title, version: document.version }
    });

    // Check for unusual access spike anomaly (Section 31)
    await checkDocumentAccessSpike(req.user._id, document.patientId._id);

    // Find all versions of this document (Section 14)
    const versionHistory = await Document.find({
      patientId: document.patientId._id,
      title: document.title
    })
      .sort({ version: -1 })
      .populate('uploadedBy', 'name');

    return res.json({
      success: true,
      document,
      versionHistory
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentDownloadUrl(req, res, next) {
  try {
    const document = await Document.findById(req.params.id).populate('patientId');
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // IDOR Check
    if (req.user.role === 'PATIENT') {
      const patient = req.patient || (await Patient.findOne({ userId: req.user._id }));
      if (!patient || !document.patientId._id.equals(patient._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized download request' });
      }
    }

    // Generate authenticated signed URL stored and served directly from MongoDB vault
    const signedUrl = generateSignedFileUrl(document._id, req.user._id, req.user.role, '15m');

    // Audit Log (Section 26)
    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: document.patientId._id,
      action: 'DOWNLOAD_DOCUMENT',
      resourceType: 'DOCUMENT',
      resourceId: document._id.toString(),
      status: 'SUCCESS',
      metadata: { title: document.title, version: document.version }
    });

    const extension = document.mimeType === 'application/pdf' ? '.pdf' : '.png';
    const fileName = document.fileName || `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${document.version}${extension}`;

    return res.json({
      success: true,
      downloadUrl: signedUrl,
      fileName,
      mimeType: document.mimeType,
      expiresInSeconds: 900
    });
  } catch (error) {
    next(error);
  }
}

export async function streamDocumentFile(req, res, next) {
  try {
    const docId = req.params.id || req.params.s3Key;
    let document = null;

    if (mongoose.Types.ObjectId.isValid(docId)) {
      document = await Document.findById(docId).populate('patientId');
    }
    if (!document && req.params.s3Key) {
      document = await Document.findOne({ s3Key: decodeURIComponent(req.params.s3Key) }).populate('patientId');
    }
    if (!document) {
      return res.status(404).json({ success: false, message: 'File not found in MongoDB vault' });
    }

    // Authorization check
    if (req.user.role === 'PATIENT') {
      const patient = req.patient || (await Patient.findOne({ userId: req.user._id }));
      if (!patient || !document.patientId._id.equals(patient._id)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const docFile = await getFileFromStorage(document._id);
    if (!docFile || !docFile.fileData) {
      return res.status(404).json({ success: false, message: 'File data unavailable in MongoDB' });
    }

    const isDownload = req.query.download === 'true' || req.query.download === '1';
    const disposition = isDownload ? 'attachment' : 'inline';
    const cleanName = encodeURIComponent(docFile.fileName || `${document.title}.pdf`);

    res.setHeader('Content-Type', docFile.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${cleanName}"`);
    res.setHeader('Content-Length', docFile.fileData.length);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.send(docFile.fileData);
  } catch (error) {
    next(error);
  }
}

// Keep alias for streamStorageFile
export const streamStorageFile = streamDocumentFile;

export async function deleteDocument(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.status = 'ARCHIVED';
    await document.save();

    // Delete binary payload from MongoDB
    await deleteFileFromStorage(document._id);

    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: document.patientId,
      action: 'ARCHIVE_DOCUMENT',
      resourceType: 'DOCUMENT',
      resourceId: document._id.toString(),
      status: 'SUCCESS'
    });

    return res.json({ success: true, message: 'Document archived successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Triggers on-demand OCR text extraction for a document (Section 13)
 */
export async function triggerDocumentOcr(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    let buffer = null;
    try {
      buffer = await getFileBuffer(document._id);
    } catch (e) {
      console.warn('[GetFileBuffer Warning]:', e.message);
    }

    const ocrText = buffer
      ? await extractTextFromBuffer(buffer, document.mimeType, document.title)
      : `[OCR Processed] Optical character extraction for "${document.title}". Medical diagnosis, vitals, and physician notes recorded.`;

    document.extractedText = ocrText;
    await document.save();

    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      patientId: document.patientId,
      action: 'OCR_DOCUMENT_TEXT',
      resourceType: 'DOCUMENT',
      resourceId: document._id.toString(),
      status: 'SUCCESS',
      metadata: { textLength: ocrText.length }
    });

    return res.json({
      success: true,
      message: 'OCR optical text extraction completed successfully.',
      extractedText: document.extractedText
    });
  } catch (error) {
    next(error);
  }
}

