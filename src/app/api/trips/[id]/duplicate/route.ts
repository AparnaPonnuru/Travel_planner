import { NextRequest, NextResponse } from 'next/server';
import { dbTrips } from '@/lib/db';
import { TripSnapshot } from '@/types/trip';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentTrip = dbTrips.findById(id);

    if (!currentTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const newId = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newShareId = `share-${Math.random().toString(36).substring(2, 8)}`;

    const clonedTrip: TripSnapshot = {
      ...JSON.parse(JSON.stringify(currentTrip)),
      id: newId,
      title: `${currentTrip.title} (Copy)`,
      shareId: newShareId,
      status: 'generated',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbTrips.create(clonedTrip);

    return NextResponse.json({ trip: clonedTrip });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to duplicate trip' }, { status: 500 });
  }
}
