// /app/api/rewrite/phase0/route.js

import { NextResponse } from 'next/server';
import { runPhase0 } from './phase0.js'; // Your cleaned Phase 0

export const config = { runtime: 'nodejs' };

export async function POST(req) {
  try {
    const { text, prompt } = await req.json();
    const input = text || prompt;

    if (!input || typeof input !== 'string' || input.trim() === '') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    console.log('[Phase 0] ✅ Input received:', input.length, 'chars');

    const output = await runPhase0(input);

    return NextResponse.json({ rewrite: output }, { status: 200 });

  } catch (err) {
    console.error('[Phase 0 Error]', err.message);
    return NextResponse.json({ error: 'Phase 0 failed: ' + err.message }, { status: 500 });
  }
}
