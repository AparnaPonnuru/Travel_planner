import { NextRequest, NextResponse } from 'next/server';
import { dbTrips } from '@/lib/db';
import { buildCompleteItinerary } from '@/lib/ai/engine';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let trip = dbTrips.findById(id) || dbTrips.findByShareId(id);

    if (!trip && (id === 'trip-kerala-flagship' || id.includes('kerala'))) {
      const generated = buildCompleteItinerary({
        destination: 'Kerala',
        origin: 'Hyderabad',
        startDate: '2026-12-12',
        durationDays: 5,
        travelers: { adults: 3, children: 0, infants: 0, partyType: 'friends' },
        budget: { tier: 'moderate', total: 60000, currency: 'INR', includesTravelToOrigin: true, contingencyPercent: 8 },
        travelStyles: ['relaxed', 'nature', 'food-focused', 'spiritual'],
        interests: ['beaches', 'nature', 'temples', 'food'],
        accommodationPreference: { type: 'hotel', features: ['central-location', 'cleanliness'] },
        transportPreferences: { primary: 'flight', local: 'local taxi', priority: 'balanced' },
        specialRequirements: { hardConstraints: ['05:45 AM Temple Pooja', 'Vegetarian dining'], softPreferences: ['Scenic ghats drive'] }
      });
      generated.id = 'trip-kerala-flagship';
      generated.title = 'Kerala Highlights & Backwaters';
      dbTrips.create(generated);
      trip = generated;
    }

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to retrieve trip' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = dbTrips.update(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trip: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = dbTrips.delete(id);
    return NextResponse.json({ success });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}
