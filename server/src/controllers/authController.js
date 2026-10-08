import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { signToken } from '../utils/jwt.js';
import { logAudit } from '../services/auditService.js';
import { checkFailedLogins } from '../services/anomalyService.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || 'Validation error',
        errors: parsed.error.format()
      });
    }

    const { name, email, password, role, department, licenseNumber, specialization, phone, dateOfBirth, gender, bloodGroup } = parsed.data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'PATIENT',
      status: 'ACTIVE'
    });

    let roleProfile = null;

    if (user.role === 'PATIENT') {
      const patientCount = await Patient.countDocuments();
      const patientNumber = `PAT-${new Date().getFullYear()}-${String(patientCount + 1).padStart(4, '0')}`;
      roleProfile = await Patient.create({
        userId: user._id,
        patientNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender || 'Undisclosed',
        bloodGroup: bloodGroup || 'Unknown',
        contact: {
          phone: phone || ''
        }
      });
    } else if (user.role === 'DOCTOR') {
      roleProfile = await Doctor.create({
        userId: user._id,
        department: department || 'General Medicine',
        licenseNumber: licenseNumber || `MED-LIC-${Date.now().toString().slice(-6)}`,
        specialization: specialization || 'General Practitioner',
        status: 'ACTIVE'
      });
    }

    await logAudit({
      req,
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      patientId: roleProfile?._id,
      action: 'REGISTER_USER',
      resourceType: 'AUTH',
      resourceId: user._id.toString(),
      status: 'SUCCESS',
      metadata: { role: user.role }
    });

    const token = signToken({ id: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: roleProfile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || 'Invalid email or password format'
      });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user) {
      await logAudit({
        req,
        userEmail: email,
        role: 'ANONYMOUS',
        action: 'LOGIN_FAILURE',
        resourceType: 'AUTH',
        status: 'FAILURE',
        metadata: { reason: 'User not found' }
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      await logAudit({
        req,
        userId: user._id,
        userEmail: user.email,
        userName: user.name,
        role: user.role,
        action: 'LOGIN_FAILURE',
        resourceType: 'AUTH',
        resourceId: user._id.toString(),
        status: 'FAILURE',
        metadata: { reason: 'Invalid password' }
      });
      await checkFailedLogins(email, req.ip || '127.0.0.1');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${user.status.toLowerCase()}. Please contact administration.`
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    let profile = null;
    if (user.role === 'PATIENT') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    await logAudit({
      req,
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      patientId: profile?._id,
      action: 'LOGIN_SUCCESS',
      resourceType: 'AUTH',
      resourceId: user._id.toString(),
      status: 'SUCCESS'
    });

    const token = signToken({ id: user._id, role: user.role });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'PATIENT') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user) {
      await logAudit({
        req,
        userId: req.user._id,
        userEmail: req.user.email,
        userName: req.user.name,
        role: req.user.role,
        action: 'LOGOUT',
        resourceType: 'AUTH',
        resourceId: req.user._id.toString(),
        status: 'SUCCESS'
      });
    }

    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}
