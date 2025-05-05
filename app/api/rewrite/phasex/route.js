import { NextResponse } from 'next/server';
import { runPhaseX } from './phasex.js';

export const config = {
  runtime: 'nodejs'
};

export async function POST(req) {
  try {
    const { text, prompt } = await req.json();
    const input = text || prompt;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid input' }, { status: 400 });
    }

    console.log('[PhaseX] 🔁 7-pass rewrite triggered...');
    const result = await runPhaseX(input);

    return NextResponse.json({ rewrite: result }, { status: 200 });

  } catch (err) {
    console.error('[PhaseX Error]', err);
    return NextResponse.json({ error: 'PhaseX failed: ' + err.message }, { status: 500 });
  }
}
