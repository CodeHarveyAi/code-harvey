// /app/api/rewrite/phase6/route.js
import { NextResponse } from 'next/server';
import { runPhase6 } from './phase6.js';

export const config = { runtime: 'nodejs' };

export async function POST(req) {
  try {
    const { text, prompt } = await req.json();
    const input = text || prompt;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    console.log('[Phase 6] 🚀 Starting Claude pass...');

    const output = await runPhase6(input);

    return NextResponse.json({ rewrite: output }, { status: 200 });
  } catch (err) {
    console.error('[Phase 6 Error]', err.message);
    return NextResponse.json({ error: 'Phase 6 failed: ' + err.message }, { status: 500 });
  }
}
