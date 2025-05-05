// /app/api/rewrite/route7.js

import { NextResponse } from 'next/server';
import { runPhase7 } from './phase7/phase7.js';

export const config = { runtime: 'nodejs' };

export async function POST(req) {
  try {
    const { text, prompt } = await req.json();
    const input = text || prompt;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid input' }, { status: 400 });
    }

    console.log('[Phase 7] 🧹 Final cleanup check starting...');

    const result = await runPhase7(input);

    return NextResponse.json({ rewrite: result }, { status: 200 });

  } catch (err) {
    console.error('[Phase 7 Error]', err.message);
    return NextResponse.json({ error: 'Phase 7 failed: ' + err.message }, { status: 500 });
  }
}
