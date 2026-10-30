import mongoose from 'mongoose';

const documentFileSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      unique: true,
      index: true
    },
    fileData: {
      type: Buffer,
      required: true
    },
    mimeType: {
      type: String,
      required: true,
      default: 'application/pdf'
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('DocumentFile', documentFileSchema);
