import { replaceClashes } from '@/lib/replaceclashessmart.js';
import { breakPacingPatterns, removeMirroredPhrases } from '@/lib/structuretools.js'; // ✅ ADD THIS
import { removeBannedPhrases } from '@/lib/filters.js'; // 

export function runHumanizerPass(input) {
  if (!input || typeof input !== 'string') return input;
  let output = input;

  // 1. Remove generic robotic openers
  output = output.replace(/\b(in today’s|in conclusion|furthermore|moreover|additionally|ultimately),?\b/gi, '');

  // 2. Replace em dashes
  output = output.replace(/—/g, ',');

  // 3. Remove figurative or AI-adjacent phrases
  output = output.replace(/\b(tug[- ]?of[- ]?war|battle|journey|storm|landscape|framework|navigate|painted a picture)\b/gi, '');

  // ✅ 4. Remove banned phrases
  output = removeBannedPhrases(output);

  // 5. Resolve phrase clashes (e.g., “rapidly growing innovation”)
  output = replaceClashes(output);

  // 6. Mirror-busting & pacing disruptions
  output = removeMirroredPhrases(output);
  output = breakPacingPatterns(output);

  // 7. Final cleanup for redundancy
  output = output.replace(/(That’s where the issue started\.\s*){2,}/gi, 'That’s where the issue started. ');
  output = output.replace(/\s*And that’s where the issue started\./gi, '');

  return output.trim();
}
