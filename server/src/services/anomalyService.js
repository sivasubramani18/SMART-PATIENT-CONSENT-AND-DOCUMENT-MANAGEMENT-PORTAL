import AuditLog from '../models/AuditLog.js';
import SecurityAlert from '../models/SecurityAlert.js';
import User from '../models/User.js';
import { createNotification } from './notificationService.js';

/**
 * Checks for rapid document access spikes (>10 accesses within 5 minutes)
 * Adheres to Section 31 & 32
 */
export async function checkDocumentAccessSpike(userId, patientId) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const accessCount = await AuditLog.countDocuments({
      userId,
      action: { $in: ['VIEW_DOCUMENT', 'DOWNLOAD_DOCUMENT'] },
      timestamp: { $gte: fiveMinutesAgo }
    });

    if (accessCount >= 8) {
      // Check if an open alert already exists for this user in the last 15 min to prevent duplicate spam
      const existingAlert = await SecurityAlert.findOne({
        userId,
        type: 'UNUSUAL_ACCESS_SPIKE',
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      });

      if (!existingAlert) {
        const user = await User.findById(userId);
        const alert = await SecurityAlert.create({
          userId,
          type: 'UNUSUAL_ACCESS_SPIKE',
          severity: 'HIGH',
          description: `Unusual rapid document access spike detected: ${accessCount} records accessed by ${user?.name || 'User'} within 5 minutes.`,
          count: accessCount,
          timePeriod: '5m',
          status: 'OPEN',
          metadata: { patientId, accessCount }
        });

        // Notify Admins
        const admins = await User.find({ role: 'ADMIN' });
        for (const admin of admins) {
          await createNotification({
            userId: admin._id,
            title: 'SECURITY ALERT: Rapid Document Access Spike',
            message: `User ${user?.name} accessed ${accessCount} clinical files in 5 minutes. Audit flagged for review.`,
            type: 'SECURITY_ALERT',
            link: '/admin/dashboard'
          });
        }

        return alert;
      }
    }
    return null;
  } catch (err) {
    console.error('[AnomalyService AccessSpike Error]:', err.message);
    return null;
  }
}

/**
 * Checks for multiple consecutive failed logins (>3 in 10 minutes)
 */
export async function checkFailedLogins(email, ipAddress) {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const failureCount = await AuditLog.countDocuments({
      userEmail: email,
      action: 'LOGIN_FAILURE',
      timestamp: { $gte: tenMinutesAgo }
    });

    if (failureCount >= 3) {
      const existingAlert = await SecurityAlert.findOne({
        type: 'MULTIPLE_FAILED_LOGINS',
        'metadata.email': email,
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      });

      if (!existingAlert) {
        const alert = await SecurityAlert.create({
          type: 'MULTIPLE_FAILED_LOGINS',
          severity: 'MEDIUM',
          description: `Repeated authentication failures (${failureCount} attempts) targeting account ${email} from IP ${ipAddress}.`,
          count: failureCount,
          timePeriod: '10m',
          status: 'OPEN',
          metadata: { email, ipAddress, failureCount }
        });

        // Notify Admins
        const admins = await User.find({ role: 'ADMIN' });
        for (const admin of admins) {
          await createNotification({
            userId: admin._id,
            title: 'SECURITY WARNING: Multiple Failed Logins',
            message: `Repeated failed logins (${failureCount}) targeting ${email} from IP ${ipAddress}.`,
            type: 'SECURITY_ALERT',
            link: '/admin/dashboard'
          });
        }

        return alert;
      }
    }
    return null;
  } catch (err) {
    console.error('[AnomalyService FailedLogins Error]:', err.message);
    return null;
  }
}

/**
 * Flags unauthorized access attempts (Section 31 IDOR / Unauthorized)
 */
export async function flagUnauthorizedAttempt({ userId, userEmail, userName, role, resourceType, resourceId, reason }) {
  try {
    const alert = await SecurityAlert.create({
      userId,
      type: 'UNAUTHORIZED_IDOR_ATTEMPT',
      severity: 'HIGH',
      description: `Unauthorized access blocked: ${userName || userEmail} (${role}) attempted to access ${resourceType} [${resourceId}]. Reason: ${reason}`,
      count: 1,
      timePeriod: '1m',
      status: 'OPEN',
      metadata: { resourceType, resourceId, reason }
    });

    const admins = await User.find({ role: 'ADMIN' });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        title: 'SECURITY WARNING: Unauthorized Access Attempt',
        message: `${userName} (${role}) attempted unauthorized access to ${resourceType} (${resourceId}).`,
        type: 'SECURITY_ALERT',
        link: '/admin/dashboard'
      });
    }

    return alert;
  } catch (err) {
    console.error('[AnomalyService Unauthorized Error]:', err.message);
    return null;
  }
}
