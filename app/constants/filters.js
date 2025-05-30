// File: app/lib/filters.js
// Role: Text-level replacements using the new, enhanced rules

import {
  cleanAILanguage,
  phraseReplacements,
  wordReplacements,
  destroyAIWords,
  verbPatterns
} from '@/constants/rules.js';
import { bannedPhrases } from '@/constants/bannedphrases.js';
import { protectKeyWords } from '@/constants/protectedkeywords.js';

/**
 * Performs a full AI-language cleanup using the enhanced rules.
 * This should be the main entry point for cleaning text.
 */
export function cleanAIText(text) {
  return cleanAILanguage(text);
}

/**
 * Just apply phrase replacements (without full AI cleanup - for when text is already cleaned)
 */
export function applyPhraseReplacements(text, map = phraseReplacements) {
  let result = text;
  for (const [from, to] of Object.entries(map)) {
    result = result.replace(new RegExp(from, 'gi'), to);
  }
  return result;
}

/**
 * Just apply word replacements (without full AI cleanup - for when text is already cleaned)
 */
export function applyWordReplacements(text, replacements = wordReplacements) {
  let result = text;
  for (const [word, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, match =>
      match[0] === match[0].toUpperCase()
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
        : replacement
    );
  }
  return result;
}

/**
 * Remove banned phrases
 */
export function removeBannedPhrases(text, bannedList = bannedPhrases) {
  let result = text;
  bannedList.forEach(phrase => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escaped}(\\s+\\w+)?[.,;:!\\-]?(\\s+)?`, 'gi');
    result = result.replace(pattern, '');
  });
  return result.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Combined cleanup function that applies all filters in the correct order
 */
export function applyAllFilters(text) {
  let result = text;
  
  // 1. First destroy AI words
  result = destroyAIWords(result);
  
  // 2. Apply phrase replacements
  result = applyPhraseReplacements(result);
  
  // 3. Apply word replacements
  result = applyWordReplacements(result);
  
  // 4. Remove banned phrases
  result = removeBannedPhrases(result);

  // 5. Apply verb patterns properly
  verbPatterns.patterns.forEach(({ pattern, replacements }) => {
    result = result.replace(pattern, (match) => {
      const lower = match.toLowerCase();
      if (replacements[lower]) {
        const replacement = replacements[lower];
        return match[0] === match[0].toUpperCase() 
          ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
          : replacement;
      }
      return match;
    });
  });
  
  return result;
}

/**
 * Apply filters with keyword protection
 */
export function applyFiltersWithProtection(text, keywords = protectKeyWords) {
  // Create a map to store protected phrases
  const protectedMap = new Map();
  let tempText = text;
  let placeholderIndex = 0;
  
  // Replace protected keywords with placeholders
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    tempText = tempText.replace(regex, (match) => {
      const placeholder = `__PROTECTED_${placeholderIndex}__`;
      protectedMap.set(placeholder, match);
      placeholderIndex++;
      return placeholder;
    });
  });
  
  // Apply all filters
  tempText = applyAllFilters(tempText);
  
  // Restore protected keywords
  protectedMap.forEach((original, placeholder) => {
    tempText = tempText.replace(placeholder, original);
  });
  
  return tempText;
}

/**
 * Export individual functions and the main cleanup
 */
export {
  cleanAIText as default,
  destroyAIWords,
  applyFiltersWithProtection as smartClean
};