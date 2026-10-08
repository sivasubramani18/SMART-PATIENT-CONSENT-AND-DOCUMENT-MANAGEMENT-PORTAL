import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    patientNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Undisclosed'],
      default: 'Undisclosed'
    },
    contact: {
      phone: String,
      address: String,
      city: String,
      postalCode: String
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown'
    },
    allergies: [{
      type: String
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
