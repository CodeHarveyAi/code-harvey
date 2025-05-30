// File: app/phases/runPhase4.js

import { patchTransitions, finalizeTransitions } from '@/lib/transitionpatcher.js';
import { softGrammarFix } from '@/lib/grammarfix.js';
import { cleanPatterns } from '@/lib/cleanpatterns.js';
import { sanitizeMisusedTransitions } from '@/lib/transitionvalidator.js';
import { detectTransitions, replaceAITransitions } from '@/lib/transitiondetector.js';

export async function runPhase4(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('[Phase 4] ❌ Invalid input:', text);
    return '';
  }

  // 0) First run the AI‐style → human transition swap
  let output = replaceAITransitions(text);
  console.log('[Phase 4] ✅ replaceAITransitions applied:', output);

  // 1) If after that there’s nothing left to patch, skip
  if (!detectTransitions(output)) {
    console.log('[Phase 4] ⏩ No transitions detected. Skipping Phase 4.');
    return output;
  }

  try {
    // 2) Patch the remaining transitions to more natural ones
    output = patchTransitions(output, {
      contrast: true,
      result: true,
      addition: true,
      clarification: true,
      sequence: true,
      summary: true,
      reason: true,
      emphasis: true,
      dropRate: 0.15,
      informalRatio: 0.65,
      softPunctuation: true
    });
    console.log('[Phase 4] ✅ Transition patching complete');

    // 3) Drop any mis‐used transitions
    output = sanitizeMisusedTransitions(output);
    console.log('[Phase 4] ✅ Transition context check complete');

    // 4) Clean up any leftover patterns/hedges
    output = cleanPatterns(output);
    console.log('[Phase 4] ✅ Clean patterns pass complete');

    // 5) Light grammar stitch
    output = await softGrammarFix(output);
    console.log('[Phase 4] ✅ Soft grammar stitching complete');

    // 6) Restore our inline [[TRANS:…]] markers
    output = finalizeTransitions(output);
    // 7) Final punctuation/spacing cleanup
    output = output
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([.,!?])/g, '$1')
      .replace(/([.,!?])(?=[^\s])/g, '$1 ')
      .replace(/\s*-\s*/g, '-')
      .trim();

    console.log('[Phase 4] ✅ Final transition pass complete');
    return output;
  } catch (err) {
    console.error('[Phase 4] ❌ Processing Error:', err.message);
    return text;
  }
}
