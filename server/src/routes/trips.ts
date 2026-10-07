import { Router, Request, Response } from 'express';
import { Trip } from '../models/Trip';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

import mongoose from 'mongoose';

// In-memory fallback cache for when MongoDB is disconnected or connecting
const memoryTrips = new Map<string, any>();

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// POST /api/trips — Generate a new trip via Python agent service
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || 'demo-user-1';
    const body = req.body;

    // Forward to Python Agent Service (sync)
    const agentResponse = await fetch(`${AGENT_SERVICE_URL}/api/agents/plan-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: body.destination,
        origin: body.origin || 'Hyderabad',
        start_date: body.startDate || body.start_date || '',
        duration_days: body.durationDays || body.duration_days || 5,
        travelers: body.travelers || { adults: 2, children: 0, infants: 0, party_type: 'couple' },
        budget: body.budget || { tier: 'moderate', total: 50000, currency: 'INR', contingency_percent: 8 },
        travel_styles: body.travelStyles || body.travel_styles || ['relaxed'],
        interests: body.interests || ['nature'],
        accommodation_type: body.accommodationPreference?.type || body.accommodation_type || 'hotel',
        transport_primary: body.transportPreferences?.primary || body.transport_primary || 'train',
        transport_local: body.transportPreferences?.local || body.transport_local || 'local taxi',
        hard_constraints: body.specialRequirements?.hardConstraints || body.hard_constraints || [],
        soft_preferences: body.specialRequirements?.softPreferences || body.soft_preferences || [],
      }),
    });

    if (!agentResponse.ok) {
      const err = await agentResponse.text();
      res.status(500).json({ error: 'Agent service failed', details: err });
      return;
    }

    const agentResult: any = await agentResponse.json();
    const tripData = agentResult.trip;
    tripData.userId = userId;

    let tripId = 'trip_' + Date.now();
    if (isMongoConnected()) {
      try {
        const saved = await Trip.create(tripData);
        tripId = saved._id.toString();
        tripData._id = saved._id;
      } catch (dbErr) {
        console.warn('MongoDB save failed, using memory store:', dbErr);
      }
    }
    tripData.id = tripId;
    memoryTrips.set(tripId, tripData);

    res.status(201).json({
      trip: tripData,
      agentEvents: agentResult.agent_events || [],
    });
  } catch (err: any) {
    console.error('Trip generation error:', err);
    res.status(500).json({ error: 'Failed to generate trip', details: err.message });
  }
});

// POST /api/trips/stream — SSE streaming trip generation
router.post('/stream', async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'demo-user-1';
  const body = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const agentResponse = await fetch(`${AGENT_SERVICE_URL}/api/agents/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: body.destination,
        origin: body.origin || 'Hyderabad',
        start_date: body.startDate || '',
        duration_days: body.durationDays || 5,
        travelers: body.travelers || { adults: 2, children: 0, infants: 0, party_type: 'couple' },
        budget: body.budget || { tier: 'moderate', total: 50000, currency: 'INR', contingency_percent: 8 },
        travel_styles: body.travelStyles || ['relaxed'],
        interests: body.interests || ['nature'],
        hard_constraints: body.specialRequirements?.hardConstraints || [],
        soft_preferences: body.specialRequirements?.softPreferences || [],
      }),
    });

    if (!agentResponse.ok || !agentResponse.body) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Agent service unavailable' })}\n\n`);
      res.end();
      return;
    }

    const reader = agentResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
          } else {
            try {
              const parsed = JSON.parse(data);

              // If it's the final trip result, persist to MongoDB or memory store
              if (parsed.type === 'trip_result' && parsed.trip) {
                parsed.trip.userId = userId;
                if (body.mandatoryPlaces) parsed.trip.mandatoryPlaces = body.mandatoryPlaces;
                if (body.must_visit_places) parsed.trip.must_visit_places = body.must_visit_places;
                let tripId = 'trip_' + Date.now();
                if (isMongoConnected()) {
                  try {
                    const saved = await Trip.create(parsed.trip);
                    tripId = saved._id.toString();
                    parsed.trip._id = saved._id;
                  } catch (dbErr) {
                    console.warn('MongoDB save failed, using memory store:', dbErr);
                  }
                }
                parsed.trip.id = tripId;
                memoryTrips.set(tripId, parsed.trip);
              }

              res.write(`data: ${JSON.stringify(parsed)}\n\n`);
            } catch {
              res.write(`data: ${data}\n\n`);
            }
          }
        }
      }
    }
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
  }

  res.end();
});

// GET /api/trips — List user's trips
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'demo-user-1';
  let trips: any[] = [];
  if (isMongoConnected()) {
    try {
      trips = await Trip.find({ userId }).sort({ createdAt: -1 }).lean();
    } catch {
      trips = [];
    }
  }
  if (trips.length === 0) {
    trips = Array.from(memoryTrips.values()).filter(t => t.userId === userId || !t.userId);
  }
  res.json({ trips });
});

// GET /api/trips/:id — Get single trip
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    // First check memory cache
    if (memoryTrips.has(id)) {
      res.json({ trip: memoryTrips.get(id) });
      return;
    }

    if (isMongoConnected()) {
      try {
        const trip = await Trip.findById(id).lean();
        if (trip) {
          res.json({ trip: { ...trip, id: trip._id.toString() } });
          return;
        }
        const shared = await Trip.findOne({ shareId: id }).lean();
        if (shared) {
          res.json({ trip: shared });
          return;
        }
      } catch {
        // Fall through to memory check
      }
    }

    // Try finding by shareId or substring in memory cache
    for (const trip of memoryTrips.values()) {
      if (trip.id === id || trip._id === id || trip.shareId === id) {
        res.json({ trip });
        return;
      }
    }

    res.status(404).json({ error: 'Trip not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve trip' });
  }
});

// PATCH /api/trips/:id — Update trip
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (isMongoConnected()) {
      try {
        const updated = await Trip.findByIdAndUpdate(
          id,
          { ...req.body, updatedAt: new Date() },
          { new: true }
        ).lean();
        if (updated) {
          res.json({ trip: { ...updated, id: updated._id.toString() } });
          return;
        }
      } catch {}
    }

    if (memoryTrips.has(id)) {
      const existing = memoryTrips.get(id);
      const updated = { ...existing, ...req.body, updatedAt: new Date() };
      memoryTrips.set(id, updated);
      res.json({ trip: updated });
      return;
    }

    res.status(404).json({ error: 'Trip not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (isMongoConnected()) {
      try {
        await Trip.findByIdAndDelete(id);
      } catch {}
    }
    memoryTrips.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// POST /api/trips/parse — Natural language prompt parser proxy
router.post('/parse', async (req: Request, res: Response) => {
  try {
    const resp = await fetch(`${AGENT_SERVICE_URL}/api/agents/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await resp.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
