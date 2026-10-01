import { NextRequest, NextResponse } from 'next/server';
import { dbTrips } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; versionId: string }> }) {
  try {
    const { id, versionId } = await params;
    const versionNum = parseInt(versionId, 10);

    if (isNaN(versionNum)) {
      return NextResponse.json({ error: 'Invalid version number' }, { status: 400 });
    }

    const restored = dbTrips.restoreVersion(id, versionNum);
    if (!restored) {
      return NextResponse.json({ error: 'Version not found or failed to restore' }, { status: 404 });
    }

    return NextResponse.json({ trip: restored, message: `Restored itinerary to Version ${versionNum}` });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 });
  }
}
