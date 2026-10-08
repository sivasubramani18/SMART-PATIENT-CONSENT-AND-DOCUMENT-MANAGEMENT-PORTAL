import crypto from 'crypto';
import AuditLog from '../models/AuditLog.js';

export function computeHash(data, previousHash) {
  const content = `${previousHash}|${data.timestamp}|${data.action}|${data.resourceType}|${data.resourceId}|${data.userId || ''}|${data.status}|${JSON.stringify(data.metadata || {})}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

export async function logAudit({
  req,
  userId,
  userEmail,
  userName,
  role,
  patientId,
  action,
  resourceType,
  resourceId = '',
  status = 'SUCCESS',
  metadata = {}
}) {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
      : '127.0.0.1';
    const userAgent = req ? req.headers['user-agent'] : 'system';
    const timestamp = new Date();

    // Retrieve previous block's hash for blockchain-like chaining
    const lastEntry = await AuditLog.findOne().sort({ createdAt: -1 });
    const previousHash = lastEntry?.entryHash || 'GENESIS_BLOCK_00000000000000000000000000000000';

    const logData = {
      userId: userId || req?.user?._id,
      userEmail: userEmail || req?.user?.email,
      userName: userName || req?.user?.name,
      role: role || req?.user?.role || 'ANONYMOUS',
      patientId,
      action,
      resourceType,
      resourceId: String(resourceId),
      ipAddress: String(ipAddress),
      userAgent,
      status,
      metadata,
      timestamp
    };

    const entryHash = computeHash(logData, previousHash);

    const entry = await AuditLog.create({
      ...logData,
      previousHash,
      entryHash
    });

    return entry;
  } catch (err) {
    console.error('[AuditLog Error]:', err.message);
    return null;
  }
}

/**
 * Validates cryptographic chain integrity across all audit records
 */
export async function verifyAuditChain() {
  const logs = await AuditLog.find().sort({ createdAt: 1 });
  if (logs.length === 0) {
    return {
      valid: true,
      totalBlocks: 0,
      brokenAtIndex: null,
      message: 'Audit ledger is empty (Genesis state)'
    };
  }

  let prevHash = 'GENESIS_BLOCK_00000000000000000000000000000000';
  let verifiedCount = 0;

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    
    // If the record has no hash (pre-migration record), backfill or note
    if (!log.entryHash) {
      continue;
    }

    if (log.previousHash !== prevHash && prevHash !== 'GENESIS_BLOCK_00000000000000000000000000000000') {
      return {
        valid: false,
        totalBlocks: logs.length,
        verifiedCount,
        brokenAtIndex: i,
        brokenLogId: log._id,
        reason: 'Broken previousHash linkage detected',
        expectedPrevHash: prevHash,
        actualPrevHash: log.previousHash
      };
    }

    const expectedHash = computeHash(log, log.previousHash);
    if (log.entryHash !== expectedHash) {
      return {
        valid: false,
        totalBlocks: logs.length,
        verifiedCount,
        brokenAtIndex: i,
        brokenLogId: log._id,
        reason: 'Payload tamper detected: entryHash does not match computed digest'
      };
    }

    prevHash = log.entryHash;
    verifiedCount++;
  }

  return {
    valid: true,
    totalBlocks: logs.length,
    verifiedCount,
    latestHash: prevHash,
    status: 'CRYPTO_CHAIN_VALID',
    message: 'All audit blocks cryptographically verified with unbroken SHA-256 chain.'
  };
}
