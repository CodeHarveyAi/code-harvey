// File: app/lib/transitionvalidator.js

/**
 * Detects whether two sentences contrast, reinforce, or are neutral.
 */
export function detectSentenceRelation(prev, next) {
  const POSITIVE = /\b(improve|benefit|success|increase|enhance|help|support|opportunity|important|necessary|must|can|effective)\b/i;
  const NEGATIVE = /\b(fail|risk|barrier|challenge|struggle|not|difficult|problem|obstacle|decline|loss|weakness)\b/i;

  const prevTone = POSITIVE.test(prev)
    ? 'positive'
    : NEGATIVE.test(prev)
      ? 'negative'
      : 'neutral';
  const nextTone = POSITIVE.test(next)
    ? 'positive'
    : NEGATIVE.test(next)
      ? 'negative'
      : 'neutral';

  if (prevTone !== nextTone) return 'contrast';
  if (prevTone === nextTone && prevTone !== 'neutral') return 'reinforce';
  return 'neutral';
}

/**
 * Strips out mis-used transition phrases that don’t match
 * the logical relation between sentences.
 * Only removes when the logic is a true reinforcement (not just neutral),
 * and preserves all original punctuation.
 */
export function sanitizeMisusedTransitions(text) {
  if (typeof text !== 'string') return text;

  // These are the phrases we might drop
  const transitionPhrases = ['Even so', 'However', 'Still', 'But'];

  // Split into sentences, capturing the trailing punctuation
  const parts = text.match(/[^.?!]+[.?!]+/g);
  if (!parts) return text;

  for (let i = 1; i < parts.length; i++) {
    let sentence = parts[i];

    for (const phrase of transitionPhrases) {
      // ^Phrase,?␣
      const regex = new RegExp(`^(${phrase}),?\\s+`, 'i');
      if (regex.test(sentence)) {
        // Remove it, then test the relationship
        const stripped = sentence.replace(regex, '');
        // Remove trailing punctuation for logic test
        const prevCore   = parts[i - 1].replace(/[\.\?\!]+$/, '').trim();
        const nextCore   = stripped.replace(/[\.\?\!]+$/, '').trim();
        const logic      = detectSentenceRelation(prevCore, nextCore);

        console.log(`[sanitizeMisusedTransitions] Found "${phrase}" before "${nextCore}" — logic: ${logic}`);

        // Only drop if it's a true reinforcement
        if (logic === 'reinforce') {
          sentence = stripped;
        }
      }
    }

    parts[i] = sentence;
  }

  // Re-join exactly as we split, preserving each punctuation
  return parts.join(' ');
}
