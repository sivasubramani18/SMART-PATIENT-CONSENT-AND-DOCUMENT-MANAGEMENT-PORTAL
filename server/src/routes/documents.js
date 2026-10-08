import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  getDocumentDownloadUrl,
  streamStorageFile,
  deleteDocument,
  triggerDocumentOcr
} from '../controllers/documentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('DOCTOR', 'ADMIN'), upload.single('file'), uploadDocument);
router.get('/', requireAuth, getDocuments);
router.get('/:id', requireAuth, getDocumentById);
router.get('/:id/download', requireAuth, getDocumentDownloadUrl);
router.get('/storage-stream/:s3Key', requireAuth, streamStorageFile);
router.post('/:id/ocr', requireAuth, triggerDocumentOcr);
router.delete('/:id', requireAuth, requireRole('DOCTOR', 'ADMIN'), deleteDocument);

export default router;
