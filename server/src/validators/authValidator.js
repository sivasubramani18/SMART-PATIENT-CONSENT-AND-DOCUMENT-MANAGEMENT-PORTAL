import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN', 'AUDITOR']).default('PATIENT'),
  // Role specific optional fields
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
});
