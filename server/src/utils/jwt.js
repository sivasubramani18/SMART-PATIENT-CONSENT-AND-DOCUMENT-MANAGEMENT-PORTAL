import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'consentiq_super_secure_jwt_token_key_development_32chars!';
const JWT_EXPIRES_IN = '7d';

export function signToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export const generateToken = signToken;

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

