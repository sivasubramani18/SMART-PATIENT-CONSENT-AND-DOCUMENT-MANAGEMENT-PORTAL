import AuditLog from '../models/AuditLog.js';
import Patient from '../models/Patient.js';
import { verifyAuditChain } from '../services/auditService.js';

export async function getAuditLogs(req, res, next) {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      role,
      action,
      resourceType,
      status,
      startDate,
      endDate,
      patientId
    } = req.query;

    const query = {};

    // RBAC Scoping (Section 26 & 28)
    if (req.user.role === 'PATIENT') {
      const patientProfile = await Patient.findOne({ userId: req.user._id });
      if (!patientProfile) {
        return res.json({ success: true, logs: [], total: 0, totalPages: 0, currentPage: 1 });
      }
      query.$or = [
        { patientId: patientProfile._id },
        { userId: req.user._id }
      ];
    } else if (req.user.role === 'DOCTOR') {
      // Doctor can see their actions or actions involving their patients
      if (patientId) {
        query.patientId = patientId;
      } else {
        query.$or = [
          { userId: req.user._id },
          { role: 'DOCTOR' }
        ];
      }
    } else {
      // ADMIN & AUDITOR have global visibility
      if (patientId) {
        query.patientId = patientId;
      }
    }

    if (role && (req.user.role === 'ADMIN' || req.user.role === 'AUDITOR')) {
      query.role = role.toUpperCase();
    }

    if (action) {
      query.action = action;
    }

    if (resourceType) {
      query.resourceType = resourceType.toUpperCase();
    }

    if (status) {
      query.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { userName: searchRegex },
          { userEmail: searchRegex },
          { action: searchRegex },
          { resourceType: searchRegex },
          { ipAddress: searchRegex }
        ]
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email role')
        .populate('patientId', 'mrn'),
      AuditLog.countDocuments(query)
    ]);

    return res.json({
      success: true,
      logs,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditStats(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEvents, todayEvents, failureEvents, actionBreakdown, roleBreakdown] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ timestamp: { $gte: today } }),
      AuditLog.countDocuments({ status: { $in: ['FAILURE', 'WARNING'] } }),
      AuditLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      AuditLog.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return res.json({
      success: true,
      stats: {
        totalEvents,
        todayEvents,
        failureEvents,
        actionBreakdown,
        roleBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function exportAuditLogs(req, res, next) {
  try {
    const { format = 'csv', action, resourceType, status, startDate, endDate } = req.query;

    const query = {};
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType.toUpperCase();
    if (status) query.status = status.toUpperCase();
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(1000);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=consentiq-audit-export-${Date.now()}.json`);
      return res.send(JSON.stringify(logs, null, 2));
    }

    // Default to CSV
    const csvHeaders = 'Timestamp,User Name,User Email,Role,Action,Resource Type,Resource ID,Status,IP Address,Entry Hash\n';
    const csvRows = logs.map((l) => {
      const clean = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
      return [
        clean(l.timestamp?.toISOString()),
        clean(l.userName),
        clean(l.userEmail),
        clean(l.role),
        clean(l.action),
        clean(l.resourceType),
        clean(l.resourceId),
        clean(l.status),
        clean(l.ipAddress),
        clean(l.entryHash)
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=consentiq-audit-ledger-${Date.now()}.csv`);
    return res.send(csvHeaders + csvRows);
  } catch (error) {
    next(error);
  }
}

export async function verifyLedgerChain(req, res, next) {
  try {
    const verification = await verifyAuditChain();
    return res.json({
      success: true,
      verification
    });
  } catch (error) {
    next(error);
  }
}
