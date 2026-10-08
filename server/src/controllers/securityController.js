import SecurityAlert from '../models/SecurityAlert.js';
import { logAudit } from '../services/auditService.js';

export async function getAlerts(req, res, next) {
  try {
    const { severity, status, type } = req.query;

    const query = {};
    if (severity) query.severity = severity.toUpperCase();
    if (status) query.status = status.toUpperCase();
    if (type) query.type = type;

    const alerts = await SecurityAlert.find(query)
      .populate('userId', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    const openCount = await SecurityAlert.countDocuments({ status: 'OPEN' });

    return res.json({
      success: true,
      alerts,
      openCount
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveAlert(req, res, next) {
  try {
    const { id } = req.params;
    const { status = 'RESOLVED', resolutionNotes } = req.body;

    const alert = await SecurityAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Security alert not found.' });
    }

    alert.status = status.toUpperCase();
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user._id;
    if (resolutionNotes) {
      alert.metadata = { ...alert.metadata, resolutionNotes };
    }
    await alert.save();

    await logAudit({
      req,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'RESOLVE_SECURITY_ALERT',
      resourceType: 'SECURITY_ALERT',
      resourceId: alert._id.toString(),
      status: 'SUCCESS',
      metadata: { newStatus: alert.status, resolutionNotes }
    });

    return res.json({
      success: true,
      message: `Security alert marked as ${alert.status}.`,
      alert
    });
  } catch (error) {
    next(error);
  }
}

export async function getSecurityMetrics(req, res, next) {
  try {
    const [total, open, highOrCritical, byType] = await Promise.all([
      SecurityAlert.countDocuments(),
      SecurityAlert.countDocuments({ status: 'OPEN' }),
      SecurityAlert.countDocuments({ severity: { $in: ['HIGH', 'CRITICAL'] } }),
      SecurityAlert.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);

    return res.json({
      success: true,
      metrics: {
        total,
        open,
        highOrCritical,
        byType
      }
    });
  } catch (error) {
    next(error);
  }
}
