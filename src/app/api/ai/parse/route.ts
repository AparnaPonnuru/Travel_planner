import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguageTrip } from '@/lib/ai/engine';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const parsedConfig = parseNaturalLanguageTrip(prompt);
    return NextResponse.json({ parsedConfig });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse natural language request' }, { status: 500 });
  }
}
