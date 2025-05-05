// /app/api/rewrite/phasex/phasex.js
import { runPhase0 } from '../phase0/phase0.js';
import { runPhase1 } from '../phase1/phase1.js';
import { runPhase2 } from '../phase2/phase2.js';
import { runPhase3 } from '../phase3/phase3.js';
import { runPhase4 } from '../phase4/phase4.js';
import { runPhase5 } from '../phase5/phase5.js';
import { runPhase6 } from '../phase6/phase6.js';
import { runPhase7 } from '../phase7/phase7.js';

/**
 * PhaseX: Full 7-pass rewrite pipeline
 * Applies each phase in sequence.
 */
export async function runPhaseX(input) {
  if (!input || typeof input !== 'string') return input;


  let output = input;
  output = await runPhase0(output);
  output = await runPhase1(output);
  output = await runPhase2(output);
  if (!output || output.trim() === '') throw new Error('Phase 2 returned empty result');

  output = await runPhase3(output);
  output = await runPhase4(output);
  output = await runPhase5(output);
  output = await runPhase6(output);

  const final = await runPhase7(output);

  return typeof final === 'string'
  ? final.trim()
  : typeof final?.rewrite === 'string'
  ? final.rewrite.trim()
    : String(final || '');
  }
