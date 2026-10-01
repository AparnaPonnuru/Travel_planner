import { NextRequest, NextResponse } from 'next/server';
import { dbUsers } from '@/lib/db';
import { verifyJwtToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('voyage_token')?.value;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    const user = dbUsers.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { passwordHash: _, ...profile } = user;
    return NextResponse.json({ user: profile });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
