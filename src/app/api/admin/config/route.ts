import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/db';

export async function GET() {
  try {
    const config = dbAdmin.getConfig();
    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch admin config' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const updates = await req.json();
    const updatedConfig = dbAdmin.updateConfig(updates);
    return NextResponse.json({ config: updatedConfig, message: 'AI configuration updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update admin config' }, { status: 500 });
  }
}
