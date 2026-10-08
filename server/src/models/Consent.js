import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    procedure: {
      type: String,
      required: true,
      trim: true
    },
    purpose: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    benefits: {
      type: [String],
      default: []
    },
    risks: {
      type: [String],
      default: []
    },
    alternatives: {
      type: [String],
      default: []
    },
    additionalInformation: {
      type: String,
      default: ''
    },
    version: {
      type: Number,
      default: 1
    },
    parentConsentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consent',
      default: null
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SENT',
        'VIEWED',
        'UNDER_REVIEW',
        'ACCEPTED',
        'REJECTED',
        'ACTIVE',
        'EXPIRED',
        'REVOKED'
      ],
      default: 'SENT',
      index: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    viewedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    revokedAt: Date,
    revocationReason: String,
    expiresAt: {
      type: Date,
      required: true
    },
    signatureMetadata: {
      patientConfirmed: Boolean,
      verificationMethod: String, // e.g. "DIGITAL_OTP", "SECURE_PIN", "DIRECT_CONFIRMATION"
      ipAddress: String,
      userAgent: String,
      timestamp: Date,
      signatureHash: String
    },
    comprehensionAnswers: [
      {
        question: String,
        selectedAnswer: String,
        isCorrect: Boolean
      }
    ]
  },
  { timestamps: true }
);

consentSchema.index({ patientId: 1, status: 1 });

export default mongoose.model('Consent', consentSchema);
