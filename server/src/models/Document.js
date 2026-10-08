import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    documentType: {
      type: String,
      enum: [
        'Blood Report',
        'MRI',
        'CT Scan',
        'X-Ray',
        'Prescription',
        'Discharge Summary',
        'Surgery Report',
        'Consent',
        'Insurance',
        'Other'
      ],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    s3Key: {
      type: String,
      required: true
    },
    storageUrl: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    version: {
      type: Number,
      default: 1
    },
    parentDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED', 'RESTRICTED'],
      default: 'ACTIVE'
    },
    extractedText: {
      type: String,
      default: ''
    },
    tags: [String]
  },
  { timestamps: true }
);

documentSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model('Document', documentSchema);
