// ✅ File: /app/api/rewrite/route.js

import { NextResponse } from 'next/server';

import { runPhase0 }  from './phase0/phase0.js';
import { runPhase1 }  from './phase1/phase1.js';
import { runPhase2 }  from './phase2/phase2.js';
import { runPhase3 }  from './phase3/phase3.js';
import { runPhase4 }  from './phase4/phase4.js';
import { runPhase5 }  from './phase5/phase5.js';
import { runPhase6 }  from './phase6/phase6.js';
import { runPhase7 }  from './phase7/phase7.js';
import { runPhaseX }  from './phasex/phasex.js';
import { runAllPhases } from './phaserunner.js';

const phases = {
  '0': runPhase0,
  '1': runPhase1,
  '2': runPhase2,
  '3': runPhase3,
  '4': runPhase4,
  '5': runPhase5,
  '6': runPhase6,
  '7': runPhase7,
  '7pass': runPhaseX
};

export async function POST(req) {
  try {
    const { text, prompt, phase, subject = 'general', detectorTarget = null } = await req.json();
    const input = text || prompt;

    if (!input || typeof input !== 'string' || input.trim() === '') {
      return NextResponse.json({ error: 'Invalid input text' }, { status: 400 });
    }

    let result;

    if (phase) {
      if (!phases[phase]) {
        return NextResponse.json({ error: `Invalid phase: ${phase}` }, { status: 400 });
      }
      console.log(`[Router] 🔹 Running Phase ${phase}`);
      result = phase === '6' ? await phases[phase](input, { subject }) : await phases[phase](input);
    } else {
      console.log('[Router] 🧱 Running Full Pipeline (0 → 7)');
      result = await runAllPhases(input, subject, detectorTarget);
    }

    const responseText = typeof result === 'string'
      ? result
      : result != null
        ? JSON.stringify(result)
        : '';

    return new NextResponse(responseText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (err) {
    console.error('[Router Error]', err);
    return NextResponse.json(
      { error: 'Rewrite failed: ' + err.message },
      { status: 500 }
    );
  }
}

export const config = { runtime: 'nodejs' };
