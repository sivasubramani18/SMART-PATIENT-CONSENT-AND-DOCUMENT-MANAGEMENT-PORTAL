import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_STORAGE_DIR = path.resolve(__dirname, '../../uploads/documents');

// Ensure local directory exists for storage fallback
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

const isAwsConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
);

let s3Client = null;
if (isAwsConfigured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}

export function isS3Active() {
  return isAwsConfigured;
}

/**
 * Upload a document file to either AWS S3 or secure local storage vault
 */
export async function uploadFileToStorage(fileBuffer, s3Key, mimeType) {
  if (isAwsConfigured && s3Client) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256'
    });
    await s3Client.send(command);
    return {
      storageType: 'S3',
      s3Key,
      bucket: process.env.AWS_S3_BUCKET
    };
  }

  // Local Secure Storage Vault Fallback
  const safeFilename = s3Key.replace(/\//g, '_');
  const filePath = path.join(LOCAL_STORAGE_DIR, safeFilename);
  await fs.promises.writeFile(filePath, fileBuffer);

  return {
    storageType: 'LOCAL_VAULT',
    s3Key,
    localPath: filePath
  };
}

/**
 * Generate a secure time-limited signed URL for viewing/downloading
 */
export async function generateSignedFileUrl(s3Key, mimeType, expiresIn = 900) {
  if (isAwsConfigured && s3Client) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      ResponseContentType: mimeType
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  }

  // For local vault, the API provides an authenticated streaming proxy
  return `/api/documents/storage-stream/${encodeURIComponent(s3Key)}`;
}

/**
 * Get file stream directly from storage
 */
export async function getFileStream(s3Key) {
  if (isAwsConfigured && s3Client) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key
    });
    const response = await s3Client.send(command);
    return response.Body;
  }

  const safeFilename = s3Key.replace(/\//g, '_');
  const filePath = path.join(LOCAL_STORAGE_DIR, safeFilename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.createReadStream(filePath);
}

/**
 * Get full file buffer from storage
 */
export async function getFileBuffer(s3Key) {
  if (isAwsConfigured && s3Client) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key
    });
    const response = await s3Client.send(command);
    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  }

  const safeFilename = s3Key.replace(/\//g, '_');
  const filePath = path.join(LOCAL_STORAGE_DIR, safeFilename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.promises.readFile(filePath);
}

/**
 * Delete a document from storage
 */
export async function deleteFileFromStorage(s3Key) {
  if (isAwsConfigured && s3Client) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key
    });
    await s3Client.send(command);
    return true;
  }

  const safeFilename = s3Key.replace(/\//g, '_');
  const filePath = path.join(LOCAL_STORAGE_DIR, safeFilename);
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
  return true;
}
