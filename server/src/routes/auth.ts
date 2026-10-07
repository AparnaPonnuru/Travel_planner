import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, homeCity } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      homeCity: homeCity || 'Hyderabad',
      preferredTravelStyles: ['relaxed'],
      dietaryRestrictions: [],
      role: 'user',
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie('voyage_token', token, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.cookie('voyage_token', token, { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, homeCity: user.homeCity },
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('voyage_token');
  res.json({ message: 'Logged out' });
});

export default router;
