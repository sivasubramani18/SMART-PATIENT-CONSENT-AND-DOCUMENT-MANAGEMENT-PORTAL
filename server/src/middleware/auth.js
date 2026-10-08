import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account associated with token no longer exists'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please contact administrator.`
      });
    }

    req.user = user;

    // Attach role-specific sub-profile if applicable
    if (user.role === 'PATIENT') {
      req.patient = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      req.doctor = await Doctor.findOne({ userId: user._id });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication credentials' });
  }
}

export function requireRole(...allowedRoles) {
  const flattened = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!flattened.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${flattened.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
}
