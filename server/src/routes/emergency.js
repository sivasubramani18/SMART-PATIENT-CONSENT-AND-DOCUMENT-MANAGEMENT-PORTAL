import express from 'express';
import {
  createEmergencyAccess,
  getActiveSessions,
  endEmergencySession,
  getEmergencyHistory
} from '../controllers/emergencyController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/break-glass', requireRole('DOCTOR', 'ADMIN'), createEmergencyAccess);
router.get('/active', requireRole('DOCTOR', 'ADMIN', 'AUDITOR'), getActiveSessions);
router.post('/:id/end', requireRole('DOCTOR', 'ADMIN'), endEmergencySession);
router.get('/history', requireRole('ADMIN', 'AUDITOR'), getEmergencyHistory);

export default router;
