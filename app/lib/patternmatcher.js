// ✅ File: app/api/lib/patternmatcher.js
import { JoPatternBank as RawPatternBank } from './patternbank.js';
import { reflectionBank } from './reflectionbank.js';

function countSentences(text) {
  return text.split(/[.?!]/).filter(s => s.trim().length > 1).length;
}

function detectFeatures(text) {
  return {
    hasGerund: /\b\w+ing\b\s+(is|are|requires|can|may|should)/i.test(text),
    hasExpletive: /\bthere (is|are|seems|appears)\b/i.test(text),
    hasPassive: /\b(is|was|were|been|being|are|be)\b\s+\w+ed\b/i.test(text),
    hasInfinitive: /\bto\s+\w+\b/.test(text),
    wordCount: text.trim().split(/\s+/).length,
    sentenceCount: countSentences(text)
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🔍 Clean PatternBank on load
const JoPatternBank = RawPatternBank.filter(p => {
  const isValid = p && typeof p.id === 'string' && typeof p.structure === 'string' && p.conditions;
  if (!isValid) {
    console.warn(`[PatternMatcher] ⚠️ Invalid pattern removed:`, p);
  }
  return isValid;
});

/**
 * Selects the best pattern for a given text, and matches a reflection to it
 */
export function matchPatternToInput(text) {
  const features = detectFeatures(text);
  console.log('[PatternMatcher] Detected Features:', features);

  const matched = JoPatternBank.filter(pattern => {
    const { conditions = {} } = pattern;
    const hasFeature = conditions.contains
      ? features[`has${capitalize(conditions.contains)}`]
      : true;

    const isMatch = (
      (!conditions.minSentences || features.sentenceCount >= conditions.minSentences) &&
      (!conditions.sentenceCount || features.sentenceCount === conditions.sentenceCount) &&
      (!conditions.maxWords || features.wordCount <= conditions.maxWords) &&
      (!conditions.minWords || features.wordCount >= conditions.minWords) &&
      hasFeature === true &&
      (!conditions.voice || (conditions.voice === 'passive' && features.hasPassive))
    );

    if (isMatch) {
      console.log('[PatternMatcher] Pattern Matched:', pattern.id);
    }

    return isMatch;
  });

  let finalPattern = null;

  if (matched.length > 0) {
    finalPattern = matched[0];
    console.log('[PatternMatcher] Selected Pattern:', finalPattern.id);
  } else {
    finalPattern = JoPatternBank.find(
      p => p?.conditions && p.conditions.sentenceCount === features.sentenceCount
    ) || JoPatternBank.find(p => p?.id === 'basicDeclarative') || JoPatternBank[0];
    console.log('[PatternMatcher] Fallback Pattern:', finalPattern?.id);
  }

  const endingType = finalPattern.endingType;
  const reflection = reflectionBank[endingType] || null;

  return {
    selectedPattern: finalPattern,
    reflection,
    endingType
  };
}

export function validatePatternMatch(text, pattern) {
  if (!pattern || !pattern.id || typeof text !== 'string') return false;

  const features = detectFeatures(text);
  const score = calculatePatternScore(features, pattern);
  const isValid = score >= 5;

  console.log(`[PatternMatcher] Validation for Pattern ${pattern.id}: ${isValid ? 'PASSED' : 'FAILED'} (score: ${score})`);
  return isValid;
}

export function getPatternRecommendations(text, count = 3) {
  const features = detectFeatures(text);
  const validPatterns = JoPatternBank.filter(p => !!p);

  const scoredPatterns = validPatterns.map(pattern => ({
    pattern,
    score: calculatePatternScore(features, pattern)
  }));

  scoredPatterns.sort((a, b) => b.score - a.score);

  return scoredPatterns.slice(0, count).map(item => ({
    id: item.pattern.id,
    label: item.pattern.label,
    score: item.score,
    structure: item.pattern.structure
  }));
}

