import mongoose from 'mongoose';

const securityAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    type: {
      type: String,
      required: true,
      enum: [
        'UNUSUAL_ACCESS_SPIKE',
        'MULTIPLE_FAILED_LOGINS',
        'UNAUTHORIZED_IDOR_ATTEMPT',
        'SUSPICIOUS_EMERGENCY_ACCESS',
        'DOCUMENT_DOWNLOAD_SPIKE'
      ],
      default: 'UNUSUAL_ACCESS_SPIKE'
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    description: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 1
    },
    timePeriod: {
      type: String,
      default: '15m'
    },
    status: {
      type: String,
      enum: ['OPEN', 'INVESTIGATING', 'RESOLVED'],
      default: 'OPEN'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

securityAlertSchema.index({ status: 1, severity: 1, createdAt: -1 });

export default mongoose.model('SecurityAlert', securityAlertSchema);
