import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'consentiq_super_secure_jwt_token_key_development_32chars!';
const JWT_EXPIRES_IN = '7d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
