import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbUsers } from '@/lib/db';
import { signJwtToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, homeCity, currency } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = dbUsers.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = dbUsers.create({
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      passwordHash,
      homeCity: homeCity || 'Hyderabad',
      currency: currency || 'INR',
      preferredTravelStyles: ['balanced', 'cultural'],
      dietaryRestrictions: [],
      role: 'user',
      createdAt: new Date().toISOString()
    });

    const token = signJwtToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const { passwordHash: _, ...userProfile } = newUser;
    const res = NextResponse.json({ user: userProfile, token }, { status: 201 });
    res.cookies.set('voyage_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error during registration' }, { status: 500 });
  }
}
