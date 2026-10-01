import { NextRequest, NextResponse } from 'next/server';
import { dbTrips, dbAdmin } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentTrip = dbTrips.findById(id);

    if (!currentTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const updated = dbTrips.update(
      id,
      { status: 'finalized', updatedAt: new Date().toISOString() },
      'Trip officially finalized and locked for departure'
    );

    dbAdmin.incrementMetric('totalFinalized');

    return NextResponse.json({
      success: true,
      trip: updated,
      message: 'Trip itinerary finalized successfully! All reservations, routes, and packing items are prepared.'
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to finalize trip' }, { status: 500 });
  }
}
