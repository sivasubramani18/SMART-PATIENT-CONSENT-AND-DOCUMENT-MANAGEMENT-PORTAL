import express from 'express';
import { getPatients, getPatientById } from '../controllers/patientController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('DOCTOR', 'ADMIN', 'AUDITOR'), getPatients);
router.get('/:id', requireAuth, getPatientById);

export default router;
