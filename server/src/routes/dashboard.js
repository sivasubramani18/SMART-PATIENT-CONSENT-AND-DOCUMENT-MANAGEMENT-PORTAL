import express from 'express';
import {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
  getAuditorDashboard
} from '../controllers/dashboardController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/patient', requireAuth, requireRole('PATIENT'), getPatientDashboard);
router.get('/doctor', requireAuth, requireRole('DOCTOR'), getDoctorDashboard);
router.get('/admin', requireAuth, requireRole('ADMIN'), getAdminDashboard);
router.get('/auditor', requireAuth, requireRole('AUDITOR', 'ADMIN'), getAuditorDashboard);

export default router;
