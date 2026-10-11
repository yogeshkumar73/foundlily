import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'foundlily_jwt_production_secret_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
