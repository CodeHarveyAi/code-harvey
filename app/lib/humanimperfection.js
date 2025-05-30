import { phraseReplacements, wordReplacements } from '@/constants/rules.js';
import { protectedKeywords } from '@/constants/protectedkeywords.js';

export function applyHumanImperfections(text, subject = 'generic') {
  if (!text || typeof text !== 'string') return text;

  const hedgeTracker = new Set();
  const hedgePools = {
    healthcare: ['in real terms', 'it’s worth noting', 'in truth'],
    business: ['arguably', 'to be fair', 'in some ways'],
    philosophy: ['perhaps', 'some might say', 'it’s worth considering'],
    law: [],
    stem: ['in practice', 'results can vary', 'often depends on context'],
    generic: ['to be fair', 'in reality', 'arguably', 'perhaps', 'it’s worth noting']
  };

  const hedges = hedgePools[subject.toLowerCase()] || hedgePools['generic'];

  const injectSoftener = (sentence) => {
    if (/^(In reality|To be fair|Arguably|Perhaps|It’s worth noting)/i.test(sentence)) return sentence;
    const available = hedges.filter(h => !hedgeTracker.has(h));
    if (!available.length) return sentence;

    const chosen = available[Math.floor(Math.random() * available.length)];
    hedgeTracker.add(chosen);
    return `${chosen}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
  };

  const replacePhrases = (txt) => {
    if (protectedKeywords.some(kw => txt.toLowerCase().includes(kw.toLowerCase()))) {
      return txt; // Skip replacements for protected academic terms
    }

    for (const [pattern, replacement] of Object.entries(phraseReplacements)) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      txt = txt.replace(regex, replacement);
    }

    for (const [pattern, replacement] of Object.entries(wordReplacements)) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      txt = txt.replace(regex, replacement);
    }

    return txt;
  };

  const sentences = text.split(/(?<=[.?!])\s+/).map(s => s.trim());
  const result = sentences.map((sentence, idx) => {
    const needsBreak = sentence.length > 120;

    if (idx === 1 && hedgeTracker.size === 0 && !/^(in reality|to be fair|arguably|perhaps|it’s worth noting)/i.test(sentence)) {
      return injectSoftener(sentence);
    }

    // Optional rhythm break for long sentences
    if (needsBreak && sentence.includes(',')) {
      const parts = sentence.split(', ');
      if (parts.length > 1) {
        return parts.slice(0, -1).join(', ') + '. ' + parts.slice(-1)[0];
      }
    }

    return sentence;
  });

  const joined = result.join(' ').replace(/\s+/g, ' ').trim();
  return replacePhrases(joined).endsWith('.') ? replacePhrases(joined) : replacePhrases(joined) + '.';
}
