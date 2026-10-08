import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    specialization: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_LEAVE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
