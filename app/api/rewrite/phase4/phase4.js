// /app/api/rewrite/phase4/phase4.js

import { runHumanizerPass } from '@/lib/middleware.js';
import {
  applyPhraseReplacements,
  applyWordReplacements
} from '@/lib/filters.js';
import { patchTransitions } from '@/lib/transitionpatcher.js';
import { softGrammarFix } from '@/lib/grammarfix.js';

/**
 * Phase 4: Transition Repair + Phrase Cleanup + Soft Grammar Stitching
 * Adds soft disruptions, cleans robotic phrases, and stitches broken transitions.
 */
export async function runPhase4(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('[Phase 4] ❌ Invalid input:', text);
    return '';
  }

  try {
    let output = text;
    
    // Step 1: Add natural disruptions
    output = runHumanizerPass(output);
 

    // Step 2: Apply human-friendly phrase and word replacements
    output = applyPhraseReplacements(output);
  

    output = applyWordReplacements(output);
  
    // ✅ Step 3: Patch transitions with soft options
    output = patchTransitions(output, {
      contrast: true,
      result: true,
      addition: true,
      emphasis: true
    });


    // Step 4: Soft grammar patching to fix broken joins and awkward insertions
    output = await softGrammarFix(output);
  

    // Step 5: Light punctuation and spacing cleanup
    output = output.replace(/\s{2,}/g, ' ');
    output = output.replace(/\s+([.,!?])/g, '$1');
    output = output.replace(/([.,!?])(?=[^\s])/g, '$1 ');
    output = output.replace(/\s*-\s*/g, '-');
    output = output.trim();

   
    return output;

  } catch (err) {
    console.error('[Phase 4] ❌ Processing Error:', err.message);
    return String(text || '');
  }
}
