import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'CONSENT_REQUEST',
        'CONSENT_ACCEPTED',
        'CONSENT_REJECTED',
        'CONSENT_EXPIRING',
        'DOCUMENT_UPLOAD',
        'SECURITY_ALERT',
        'EMERGENCY_ACCESS',
        'SYSTEM'
      ],
      default: 'SYSTEM'
    },
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
