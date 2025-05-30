import { replaceClashes } from '@/lib/replaceclashessmart.js';
import {
  breakPacingPatterns,
  removeMirroredPhrases,
  forceSplitTriplets,
  breakRuleOfThree,
  randomizeSentenceStructure  // ✅ Add this import
} from '@/lib/structuretools.js';

import { removeBannedPhrases } from '@/constants/filters.js';
import { applyHumanImperfections } from '@/lib/humanimperfection.js';
import { injectAcademicImperfection } from '@/lib/injectacademicimperfection.js';
import { applySubjectTweaks } from '@/lib/subjectcontrol.js';
import { cleanPatterns} from '@/lib/cleanpatterns.js'; 

export function runHumanizerPass(input, subject = 'general') {
  if (!input || typeof input !== 'string') return input;
  let output = input;

  // 1. Remove robotic openers
  output = output.replace(/\b(in today’s|in conclusion|furthermore|moreover|additionally|ultimately),?\b/gi, '');

  // 2. Replace em dashes
  output = output.replace(/—/g, ',');

  // 3. Remove figurative or AI-adjacent phrases
  output = output.replace(/\b(tug[- ]?of[- ]?war|battle|journey|storm|landscape|framework|navigate|painted a picture)\b/gi, '');

  // 4. Remove banned phrases
  output = removeBannedPhrases(output);

  // 5. Resolve phrase-level clashes
  output = replaceClashes(output);
  console.log('After replaceClashes:', output);

  // 6. Break mirrored phrasing + GPT-style logic
  output = removeMirroredPhrases(output);
  console.log('After removeMirroredPhrases:', output);

  // 7. Break rhythm and pacing symmetry
  output = breakPacingPatterns(output);
  console.log('After breakPacingPatterns:', output);

  output = breakRuleOfThree(output);
  console.log('After breakRuleOfThree:', output);

  // ✅ 7.5. Force-break Rule of Three structures
  output = forceSplitTriplets(output);
  console.log('After forceSplitTriplets:', output);

  // ✅ 8. Randomize sentence structure patterns
  output = randomizeSentenceStructure(output);
  console.log('After randomizeSentenceStructure:', output);

  // 8.5 Inject academic imperfection realism
  output = injectAcademicImperfection(subject, output);
  console.log('After injectAcademicImperfection:', output);

  // 9. Add realistic hedges and soft phrasing
  output = applyHumanImperfections(output, subject);
  console.log('After applyHumanImperfections:', output);

  // 10. Apply subject-specific tweaks (entropy)
  output = applySubjectTweaks(output, subject);
  console.log('After applySubjectTweaks:', output);

  // --- 🔧 SAFETY PATCHES ---
  output = output.replace(/\. (and|but|so|or),?/gi, ', $1');
  output = output.replace(/([a-z])\. ([a-z])/g, (_, a, b) => `${a}. ${b.toUpperCase()}`);

  return output.trim();
}
export function applyRhythmCorrections(text) {
  let result = text;

  result = restructureSentences(result); // Rhythm reshaping
  result = cleanPatterns(result);        // ✅ Already includes breakBannedStructures

  return result;
}
