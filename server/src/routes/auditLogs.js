import express from 'express';
import {
  getAuditLogs,
  getAuditStats,
  exportAuditLogs,
  verifyLedgerChain
} from '../controllers/auditController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Stats & Chain Verification
router.get('/stats', requireAuth, requireRole('ADMIN', 'AUDITOR'), getAuditStats);
router.get('/verify-chain', requireAuth, requireRole('ADMIN', 'AUDITOR'), verifyLedgerChain);

// Export (Admin & Auditor)
router.get('/export', requireAuth, requireRole('ADMIN', 'AUDITOR'), exportAuditLogs);

// Query with RBAC scoping
router.get('/', requireAuth, getAuditLogs);

export default router;
