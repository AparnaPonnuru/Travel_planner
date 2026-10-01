import { NextRequest, NextResponse } from 'next/server';
import { dbTrips } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const versions = dbTrips.getVersions(id);
    return NextResponse.json({ versions });
  } catch (err) {
    return NextResponse.json({ versions: [] });
  }
}
