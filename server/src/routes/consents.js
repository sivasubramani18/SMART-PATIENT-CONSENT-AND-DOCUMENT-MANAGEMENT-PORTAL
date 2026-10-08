import express from 'express';
import {
  createConsent,
  getConsents,
  getConsentById,
  acceptConsent,
  rejectConsent,
  revokeConsent,
  explainConsentEndpoint,
  explainTermEndpoint,
  getComprehensionQuestionsEndpoint
} from '../controllers/consentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('DOCTOR', 'ADMIN'), createConsent);
router.get('/', requireAuth, getConsents);
router.get('/:id', requireAuth, getConsentById);
router.post('/:id/accept', requireAuth, requireRole('PATIENT'), acceptConsent);
router.post('/:id/reject', requireAuth, requireRole('PATIENT'), rejectConsent);
router.post('/:id/revoke', requireAuth, revokeConsent);

// AI Assistance Endpoints
router.post('/:id/explain', requireAuth, explainConsentEndpoint);
router.post('/:id/questions', requireAuth, getComprehensionQuestionsEndpoint);
router.get('/:id/questions', requireAuth, getComprehensionQuestionsEndpoint);
router.get('/:id/quiz', requireAuth, getComprehensionQuestionsEndpoint);
router.post('/:id/quiz', requireAuth, getComprehensionQuestionsEndpoint);
router.post('/explain-term', requireAuth, explainTermEndpoint);

export default router;
