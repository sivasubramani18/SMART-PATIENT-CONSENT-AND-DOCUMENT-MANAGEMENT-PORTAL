/**
 * AWS S3 has been replaced by Direct MongoDB Document Storage (DocumentFile model).
 * This service file is kept for backward-compatibility and forwards calls to storageService.js.
 */
import {
  saveFileToStorage,
  getFileFromStorage,
  getFileBuffer as getBufferFromMongo,
  deleteFileFromStorage as deleteFromMongo,
  generateSignedFileUrl as getSignedFileUrl
} from './storageService.js';

export function isS3Active() {
  return false;
}

export async function uploadFileToStorage(fileBuffer, keyOrId, mimeType) {
  return saveFileToStorage({
    documentId: keyOrId,
    fileBuffer,
    fileName: String(keyOrId),
    mimeType,
    fileSize: fileBuffer.length
  });
}

export async function generateSignedFileUrl(keyOrId, mimeType, expiresIn = 900) {
  return `/api/documents/${keyOrId}/file`;
}

export async function getFileBuffer(keyOrId) {
  return getBufferFromMongo(keyOrId);
}

export async function deleteFileFromStorage(keyOrId) {
  return deleteFromMongo(keyOrId);
}
