// /app/api/rewrite/phase2/route.js
import { NextResponse } from 'next/server';
import { runPhase2 } from './phase2.js';

export const config = { runtime: 'nodejs' };

export async function POST(req) {
  try {
    const { text, prompt } = await req.json();
    const input = text || prompt;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const output = await runPhase2(input);

    return NextResponse.json({ rewrite: output }, { status: 200 });
  } catch (err) {
    console.error('[Phase 2 Error]', err.message);
    return NextResponse.json({ error: 'Phase 2 failed: ' + err.message }, { status: 500 });
  }
}
