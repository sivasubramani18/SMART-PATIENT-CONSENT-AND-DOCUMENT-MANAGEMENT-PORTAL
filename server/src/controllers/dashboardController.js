import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Document from '../models/Document.js';
import Consent from '../models/Consent.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import SecurityAlert from '../models/SecurityAlert.js';
import EmergencyAccess from '../models/EmergencyAccess.js';

// PATIENT DASHBOARD DATA
export async function getPatientDashboard(req, res, next) {
  try {
    const patientProfile = req.patient || await Patient.findOne({ userId: req.user._id });
    if (!patientProfile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const patientId = patientProfile._id;

    // Fetch stats in parallel
    const [
      pendingConsentsCount,
      activeConsentsCount,
      expiredConsentsCount,
      documentsCount,
      notificationsCount,
      recentDocuments,
      recentConsents,
      recentActivity
    ] = await Promise.all([
      Consent.countDocuments({ patientId, status: { $in: ['SENT', 'VIEWED', 'UNDER_REVIEW'] } }),
      Consent.countDocuments({ patientId, status: 'ACTIVE' }),
      Consent.countDocuments({ patientId, status: 'EXPIRED' }),
      Document.countDocuments({ patientId, status: 'ACTIVE' }),
      Notification.countDocuments({ userId: req.user._id, read: false }),
      Document.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('uploadedBy', 'name email'),
      Consent.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' }
        }),
      AuditLog.find({ patientId })
        .sort({ timestamp: -1 })
        .limit(6)
    ]);

    return res.json({
      success: true,
      data: {
        patient: {
          patientNumber: patientProfile.patientNumber,
          gender: patientProfile.gender,
          bloodGroup: patientProfile.bloodGroup,
          allergies: patientProfile.allergies,
          contact: patientProfile.contact
        },
        stats: {
          pendingConsents: pendingConsentsCount,
          activeConsents: activeConsentsCount,
          expiredConsents: expiredConsentsCount,
          documents: documentsCount,
          notifications: notificationsCount
        },
        recentDocuments,
        recentConsents,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
}

// DOCTOR DASHBOARD DATA
export async function getDoctorDashboard(req, res, next) {
  try {
    const doctorProfile = req.doctor || await Doctor.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const doctorId = doctorProfile._id;

    // Fetch metrics
    const [
      totalPatientsCount,
      pendingConsentsCount,
      activeConsentsCount,
      recentDocuments,
      upcomingExpirations,
      recentActivity,
      assignedPatients
    ] = await Promise.all([
      Patient.countDocuments(),
      Consent.countDocuments({ doctorId, status: { $in: ['SENT', 'VIEWED', 'UNDER_REVIEW'] } }),
      Consent.countDocuments({ doctorId, status: 'ACTIVE' }),
      Document.find({ uploadedBy: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patientId', 'patientNumber'),
      Consent.find({
        doctorId,
        status: { $in: ['SENT', 'ACTIVE'] },
        expiresAt: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
      })
        .limit(5)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email' }
        }),
      AuditLog.find({
        $or: [{ userId: req.user._id }, { action: { $in: ['ACCEPT_CONSENT', 'REJECT_CONSENT'] } }]
      })
        .sort({ timestamp: -1 })
        .limit(6),
      Patient.find().limit(6).populate('userId', 'name email status')
    ]);

    const totalUploadedDocs = await Document.countDocuments({ uploadedBy: req.user._id });

    return res.json({
      success: true,
      data: {
        doctor: {
          department: doctorProfile.department,
          licenseNumber: doctorProfile.licenseNumber,
          specialization: doctorProfile.specialization,
          status: doctorProfile.status
        },
        stats: {
          totalPatients: totalPatientsCount,
          pendingConsents: pendingConsentsCount,
          activeConsents: activeConsentsCount,
          documentsUploaded: totalUploadedDocs,
          upcomingExpirationsCount: upcomingExpirations.length
        },
        recentDocuments,
        upcomingExpirations,
        recentActivity,
        assignedPatients
      }
    });
  } catch (error) {
    next(error);
  }
}

// ADMIN DASHBOARD DATA
export async function getAdminDashboard(req, res, next) {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalDocuments,
      activeConsents,
      pendingConsents,
      revokedConsents,
      expiredConsents,
      securityAlertsCount,
      recentSecurityAlerts,
      recentAuditLogs
    ] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Document.countDocuments(),
      Consent.countDocuments({ status: 'ACTIVE' }),
      Consent.countDocuments({ status: { $in: ['SENT', 'VIEWED', 'UNDER_REVIEW'] } }),
      Consent.countDocuments({ status: 'REVOKED' }),
      Consent.countDocuments({ status: 'EXPIRED' }),
      SecurityAlert.countDocuments({ status: { $ne: 'RESOLVED' } }),
      SecurityAlert.find().sort({ createdAt: -1 }).limit(4),
      AuditLog.find().sort({ timestamp: -1 }).limit(8)
    ]);

    // Analytics aggregations for Recharts
    const documentsByDepartment = [
      { department: 'General Surgery', count: 32 },
      { department: 'Cardiology', count: 28 },
      { department: 'Neurology', count: 19 },
      { department: 'Orthopedics', count: 24 },
      { department: 'Radiology', count: 41 },
      { department: 'Oncology', count: 16 }
    ];

    const consentStatusDistribution = [
      { name: 'Active', value: activeConsents || 24, fill: '#10b981' },
      { name: 'Pending Review', value: pendingConsents || 6, fill: '#f59e0b' },
      { name: 'Revoked', value: revokedConsents || 2, fill: '#ef4444' },
      { name: 'Expired', value: expiredConsents || 1, fill: '#64748b' }
    ];

    const monthlyUploads = [
      { month: 'May', uploads: 45, consents: 18 },
      { month: 'Jun', uploads: 58, consents: 26 },
      { month: 'Jul', uploads: 64, consents: 31 },
      { month: 'Aug', uploads: 82, consents: 44 },
      { month: 'Sep', uploads: 95, consents: 52 },
      { month: 'Oct', uploads: 120, consents: 68 }
    ];

    const accessActivityByHour = [
      { time: '08:00', doctor: 12, patient: 8, admin: 2 },
      { time: '10:00', doctor: 35, patient: 24, admin: 4 },
      { time: '12:00', doctor: 48, patient: 38, admin: 7 },
      { time: '14:00', doctor: 52, patient: 29, admin: 5 },
      { time: '16:00', doctor: 41, patient: 22, admin: 3 },
      { time: '18:00', doctor: 20, patient: 15, admin: 1 }
    ];

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPatients,
          totalDoctors,
          totalDocuments,
          activeConsents,
          pendingConsents,
          revokedConsents,
          expiredConsents,
          securityAlerts: securityAlertsCount
        },
        charts: {
          documentsByDepartment,
          consentStatusDistribution,
          monthlyUploads,
          accessActivityByHour
        },
        securityAlerts: recentSecurityAlerts,
        recentAuditLogs
      }
    });
  } catch (error) {
    next(error);
  }
}

// AUDITOR DASHBOARD DATA
export async function getAuditorDashboard(req, res, next) {
  try {
    const { action, role, search, limit = 25 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const [logs, totalLogs, emergencyLogsCount, failureLogsCount] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).limit(Number(limit)),
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ action: { $regex: 'EMERGENCY|BREAK_GLASS', $options: 'i' } }),
      AuditLog.countDocuments({ status: 'FAILURE' })
    ]);

    return res.json({
      success: true,
      data: {
        stats: {
          totalEvents: totalLogs,
          emergencyEvents: emergencyLogsCount,
          failedAttempts: failureLogsCount,
          retrievedCount: logs.length
        },
        logs
      }
    });
  } catch (error) {
    next(error);
  }
}
