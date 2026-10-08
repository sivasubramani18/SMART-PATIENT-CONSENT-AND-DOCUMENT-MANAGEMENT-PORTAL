import express from 'express';
import {
  getAlerts,
  resolveAlert,
  getSecurityMetrics
} from '../controllers/securityController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('ADMIN', 'AUDITOR'));

router.get('/alerts', getAlerts);
router.put('/alerts/:id/resolve', resolveAlert);
router.get('/metrics', getSecurityMetrics);

export default router;
