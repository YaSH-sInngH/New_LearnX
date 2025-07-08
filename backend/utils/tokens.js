import jwt from 'jsonwebtoken';

export function generateToken(payload, expiresIn = '1d') {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
}