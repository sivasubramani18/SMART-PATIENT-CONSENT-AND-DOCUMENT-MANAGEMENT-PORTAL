import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    userEmail: String,
    userName: String,
    role: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'ADMIN', 'AUDITOR', 'ANONYMOUS'],
      default: 'ANONYMOUS'
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: false
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    resourceType: {
      type: String,
      required: true,
      index: true
    },
    resourceId: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    previousHash: {
      type: String,
      default: 'GENESIS_BLOCK'
    },
    entryHash: {
      type: String,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
