import { NextRequest, NextResponse } from 'next/server';
import { dbTrips } from '@/lib/db';
import { buildCompleteItinerary, PlanTripRequest } from '@/lib/ai/engine';
import { verifyJwtToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Auth context (optional, fallback to demo user if not logged in)
    let userId = 'demo-user-1';
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('voyage_token')?.value;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;
    if (token) {
      const payload = verifyJwtToken(token);
      if (payload?.userId) userId = payload.userId;
    }

    const planRequest: PlanTripRequest = {
      ...body,
      userId
    };

    // Low-budget sanity validation
    if (planRequest.budget && planRequest.budget.total < 10000 && planRequest.budget.currency === 'INR') {
      return NextResponse.json({
        warning: 'The specified budget may be tight for this itinerary.',
        recommendation: 'Consider reducing trip duration or selecting shared transport.'
      });
    }

    const generatedTrip = buildCompleteItinerary(planRequest);
    const saved = dbTrips.create(generatedTrip);

    return NextResponse.json({ trip: saved }, { status: 201 });
  } catch (error) {
    console.error('Trip generation error:', error);
    return NextResponse.json({ error: 'Failed to generate itinerary. Please verify inputs and retry.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    let userId = 'demo-user-1';
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('voyage_token')?.value;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;
    if (token) {
      const payload = verifyJwtToken(token);
      if (payload?.userId) userId = payload.userId;
    }

    const trips = dbTrips.findByUserId(userId);
    return NextResponse.json({ trips });
  } catch (err) {
    return NextResponse.json({ trips: [] });
  }
}
