import { NextRequest, NextResponse } from 'next/server';
import { dbTrips, dbConversations } from '@/lib/db';
import { executeIntelligentModification } from '@/lib/ai/recalculator';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { instruction, previewOnly } = await req.json();

    if (!instruction || typeof instruction !== 'string') {
      return NextResponse.json({ error: 'Instruction text is required' }, { status: 400 });
    }

    const currentTrip = dbTrips.findById(id);
    if (!currentTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const result = executeIntelligentModification(currentTrip, instruction);

    if (previewOnly) {
      return NextResponse.json({ preview: result.appliedChanges, explanation: result.explanation });
    }

    // Save modified trip with version history
    const updated = dbTrips.update(id, result.updatedTrip, result.appliedChanges.summary || instruction);

    // Save message to conversation thread
    dbConversations.appendMessage(id, {
      role: 'user',
      content: instruction
    });
    dbConversations.appendMessage(id, {
      role: 'assistant',
      content: result.explanation,
      appliedChanges: result.appliedChanges
    });

    return NextResponse.json({
      trip: updated,
      appliedChanges: result.appliedChanges,
      explanation: result.explanation
    });
  } catch (error) {
    console.error('Modification error:', error);
    return NextResponse.json({ error: 'Failed to modify itinerary. Please try a different phrasing.' }, { status: 500 });
  }
}
