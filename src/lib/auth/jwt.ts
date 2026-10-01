import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'voyage-ai-super-secure-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export function signJwtToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
