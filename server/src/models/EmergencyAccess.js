import mongoose from 'mongoose';

const emergencyAccessSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'REVOKED'],
      default: 'ACTIVE'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    documentsAccessed: [
      {
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Document'
        },
        accessedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

emergencyAccessSchema.index({ doctorId: 1, patientId: 1, status: 1 });

export default mongoose.model('EmergencyAccess', emergencyAccessSchema);
