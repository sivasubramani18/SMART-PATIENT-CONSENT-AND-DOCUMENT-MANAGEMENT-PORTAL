import Patient from '../models/Patient.js';

export async function getPatients(req, res, next) {
  try {
    const patients = await Patient.find()
      .populate('userId', 'name email status lastLoginAt')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    next(error);
  }
}

export async function getPatientById(req, res, next) {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('userId', 'name email status');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // IDOR protection
    if (req.user.role === 'PATIENT' && !patient.userId._id.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, patient });
  } catch (error) {
    next(error);
  }
}
