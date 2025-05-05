// ✅ File: /app/lib/filters.js
// Role: Text-level replacements only

import {
  phraseReplacements,
  wordReplacements,
  contractions,
} from '@/constants/rules.js';
import { bannedPhrases } from '@/constants/bannedphrases.js';

export function applyPhraseReplacements(text, map = phraseReplacements) {
  for (const [from, to] of Object.entries(map)) {
    text = text.replace(new RegExp(from, 'gi'), to);
  }
  return text;
}

export function applyWordReplacements(text, replacements = wordReplacements) {
  let output = text;

  for (const [word, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${word}\\b(?=[.,;\\s]|$)`, 'gi');

    output = output.replace(regex, (match) => {
      // Preserve capitalization
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return output;
}

export function expandContractions(text, map = contractions) {
  for (const [from, to] of Object.entries(map)) {
    text = text.replace(new RegExp(`\\b${from}\\b`, 'gi'), to);
  }
  return text;
}

export function removeBannedPhrases(text, bannedList = bannedPhrases) {
  if (!text || !Array.isArray(bannedList)) return text;

  let output = text;

  bannedList.forEach((phrase) => {
    // Make a pattern that:
    // - ignores case
    // - allows light variations (e.g., "in today’s digital [setting/world]")
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const loosePattern = new RegExp(
      `\\b${escaped}(\\s+\\w+)?[.,;]?\\b`,
      'gi'
    );
    output = output.replace(loosePattern, '');
  });

  return output.replace(/\s{2,}/g, ' ').trim(); // cleanup double spaces
}