import { removeBannedPhrases } from '@/constants/filters.js';
import { phraseReplacements, wordReplacements } from '@/constants/rules.js';
import { protectedKeywords } from '@/constants/protectedkeywords.js';

export function injectAcademicImperfection(subject = 'generic', output) {
  if (!output || typeof output !== 'string') return output;

  const safeSubject = typeof subject === 'string' ? subject.toLowerCase() : 'generic';

  const flaws = {
    healthcare: [
      "In practice, leadership in healthcare doesn't always follow a clear model.",
      "Even with good intentions, outcomes aren’t guaranteed.",
      "Real settings often make these ideas less predictable.",
    ],
    business: [
      "What works for one company might not work for another.",
      "Even the best strategies can fall short without proper execution.",
      "Real-world business decisions often deviate from theory.",
    ],
    philosophy: [
      "Certainty is rare in this field.",
      "This point has been challenged by several thinkers.",
    ],
    stem: [
      "Real-world outcomes often introduce unexpected results.",
      "Even strong models can fail under different conditions.",
    ],
    generic: [
      "Not everyone would agree with this perspective.",
      "Theory and practice often drift apart.",
      "In reality, things don’t always go according to plan.",
    ]
  };

  const hedges = ['arguably', 'perhaps', 'in some ways', 'to some extent', 'it seems'];
  const redundancyTags = [
    ', and that’s worth considering.',
    ' — which adds complexity.',
    ', again showing how tricky this can be.'
  ];

  let sentences = output.split(/(?<=[.?!])\s+/);
  if (sentences.length < 2) return output;

  const lowerOutput = output.toLowerCase();
  const usedLines = new Set(sentences.map(s => s.trim().toLowerCase()));
  const flawList = flaws[safeSubject] || flaws.generic;

  // Step 1: Inject imperfection sentence (if unique)
  const overlyCertain = /\b(clearly|it is evident|without a doubt|undeniably|must be|is always|it proves)\b/i.test(lowerOutput);
const alreadySoftened = /\b(arguably|perhaps|it seems|in some ways|to some extent|not everyone|it depends)\b/i.test(lowerOutput);

if (overlyCertain && !alreadySoftened) {
  const flaw = flawList.find(f => !lowerOutput.includes(f.toLowerCase()));
  if (flaw && !usedLines.has(flaw.toLowerCase())) {
    sentences.splice(2, 0, flaw);
    usedLines.add(flaw.toLowerCase());
  }
}
  // Step 2: Hedge sentence before injected flaw
  if (sentences.length >= 3 && Math.random() < 0.6) {
    const hedge = hedges.find(h => !lowerOutput.includes(h));
    if (hedge) {
      const i = 1;
      const s = sentences[i];
      if (!s.toLowerCase().startsWith(hedge)) {
        sentences[i] = `${hedge}, ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
      }
    }
  }

  // Step 3: Optional redundancy tag injection
  if (sentences.length > 3 && Math.random() < 0.4) {
    const tag = redundancyTags.find(tag => !lowerOutput.includes(tag));
    if (tag) {
      const i = Math.floor(Math.random() * (sentences.length - 1));
      if (!sentences[i].endsWith(tag)) {
        sentences[i] = sentences[i].replace(/[.?!]$/, '') + tag;
      }
    }
  }

  // Rebuild paragraph
  let rebuilt = sentences.join(' ').replace(/\s+/g, ' ').trim();

  // Step 4: Remove banned phrases
  rebuilt = removeBannedPhrases(rebuilt);

  // Step 5: Protected phrase filter helper
  const containsProtectedKeyword = (text) =>
    protectedKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));

  // Step 6: Phrase-level replacements
  if (!containsProtectedKeyword(rebuilt)) {
    for (const [bad, good] of Object.entries(phraseReplacements)) {
      const re = new RegExp(`\\b${bad}\\b`, 'gi');
      rebuilt = rebuilt.replace(re, good);
    }
  }

  // Step 7: Word-level replacements
  if (!containsProtectedKeyword(rebuilt)) {
    for (const [bad, good] of Object.entries(wordReplacements)) {
      const re = new RegExp(`\\b${bad}\\b`, 'gi');
      rebuilt = rebuilt.replace(re, good);
    }
  }

  return rebuilt.endsWith('.') ? rebuilt : rebuilt + '.';
}
