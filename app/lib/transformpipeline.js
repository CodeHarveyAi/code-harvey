// ✅ File: /lib/transformall.js

import {
  expandContractions,
  applyPhraseReplacements,
  applyWordReplacements,
  removeBannedPhrases
} from '@/lib/filters.js';

import { removeFigurativeLanguage } from '@/lib/figurativefilter.js';
import { runPhrasePatches } from '@/lib/phrasepatches.js';

export async function transformAll(text, _options = {}) {
  if (!text || typeof text !== 'string') {
    console.warn('[transformAll] Invalid input type:', typeof text);
    return String(text || '');
  }

  const pipeline = [
    expandContractions,           // Step 1: Expand "don't" → "do not"
    removeBannedPhrases,          // Step 2: Remove banned phrases
    applyPhraseReplacements,      // Step 3: Long phrase replacements
    applyWordReplacements,        // Step 4: Single word replacements
    removeFigurativeLanguage,     // Step 5: Kill metaphors, idioms, etc.
    runPhrasePatches              // Step 6: Custom patching layer
  ];

  let output = text;
  let previousOutput = '';

  for (const stepFn of pipeline) {
    try {
      if (!output || typeof output !== 'string') {
        console.warn(`[transformAll] Non-string or empty result before step: ${stepFn.name}`);
        output = String(output || '');
      }

      const result = stepFn.constructor.name === 'AsyncFunction'
        ? await stepFn(output)
        : stepFn(output);

      output = String(result || '');

      const shortPreview = output.slice(0, 100).replace(/\s+/g, ' ').trim();
      console.log(`[transformAll] After ${stepFn.name || 'unnamed step'} → "${shortPreview}..."`);

      if (output === previousOutput) {
        console.warn(`[transformAll] No changes after ${stepFn.name}, ending early.`);
        break;
      }

      previousOutput = output;
    } catch (err) {
      console.error(`[transformAll] ${stepFn.name || 'step'} failed:`, err.message);
      // Continue to next step anyway
    }
  }

  return output.trim();
}
