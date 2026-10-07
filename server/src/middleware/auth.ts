import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'voyage-ai-super-secure-secret-key-2026';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function signToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.voyage_token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;

    if (token) {
      const payload = verifyToken(token);
      req.userId = payload.userId;
      req.userRole = payload.role;
    }
  } catch (err) {
    // Auth is optional for many routes — don't block
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
