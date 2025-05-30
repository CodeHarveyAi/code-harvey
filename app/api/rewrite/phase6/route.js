// /app/api/rewrite/phase6/route.js
import { NextResponse } from 'next/server';
import { runPhase6 } from './phase6.js';

export const config = { runtime: 'nodejs' };

export async function POST(req) {
  try {
    const { text, prompt, subject = 'general' } = await req.json(); // ✅ grab subject too
    const input = text || prompt;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    console.log('[Phase 6] 🚀 Starting LoRA rewrite...');

    const output = await runPhase6(input, { subject }); // ✅ PASS subject properly

    return NextResponse.json({ output }, { status: 200 });
  } catch (err) {
    console.error('[Phase 6 Error]', err.message);
    return NextResponse.json({ error: 'Phase 6 failed: ' + err.message }, { status: 500 });
  }
}
