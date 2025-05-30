// File: app/constants/rules.js
// Updated to use clean word replacements (no duplicates)

import { cleanWordReplacements, verbPatterns } from './cleanwordreplacements.js';

export const phraseReplacements = {
  // Conflict transformations
  'transform conflict into': 'change conflict into',
  'transforms conflict into': 'changes conflict into',
  'transforming conflict into': 'changing conflict into',
  'transformed conflict into': 'changed conflict into',
  'to transform conflict into': 'to change conflict into',
  'can transform conflict into': 'can change conflict into',
  'can transform': 'can change',
  'might transform conflict into': 'might change conflict into',
  'create inclusive environments': 'build spaces where people are heard',
  'use a fight to help the team grow': 'turn conflict into a chance for team development',
  'self-awareness, empathy, and skilled communication': 'listening, patience, and clarity',
  'complications emerged at precisely this juncture': 'that\'s when the issues started',
  'plays an important role': 'matters in this setting',
  'particularly for teamwork and cooperation': 'especially when people need to work together',
  'proved more challenging than anticipated': 'turned out to be harder than expected',
  'represents a significant advancement': 'marks a small step forward',
  'serves as a foundation for promoting': 'helps',
  'reflect an increasingly diverse mix of': 'include people from',
  'diverse viewpoints': 'different ideas',
  'decision-making processes': 'decisions',
  'organizations to implement': 'companies to adopt',
  'this represents the core issue': 'that\'s where the real problem usually starts',
  'the difficulty originates here': 'this is when things start to go off track',
  'problems start to emerge at this point': 'that\'s when things begin to get messy',
  'you can tell it\'s not a perfect system': 'it\'s clear the system has weak points',
  'yet this approach comes with its challenges': 'even with this effort, problems still come up sometimes',
  'goes hand in hand with': 'aligns with',
  'measures to protect': 'steps to protect',
  'measures to safeguard': 'steps to protect',
  'measures to mitigate': 'steps to reduce',
  'measures to enhance': 'steps to improve',
  'array of factors': 'range of factors',
  'morally solid': 'ethically sound',
  'professional honesty': 'professional integrity',
  'effective interpersonally': 'strong interpersonal relationships',
  'in today\'s digital landscape': 'in today\'s technology-infused environment',
  'individuals\'ve got a leader': 'a leader',
  'let\'s take high-stress healthcare settings, for example - ': '',
  'diverse array of people': 'different kinds of people',
  'grapple with challenging ethical choices': 'deal with hard ethical decisions',
  'strong sense of emotional intelligence': 'emotional awareness',
  'multifaceted scenarios': 'complex situations',
  'possess a thorough grasp of emotions': 'understand emotions well',
  'show empathy in their leadership': 'lead with empathy',
  'communicate their ideas effectively to others': 'communicate clearly',
  'ethically correct decisions': 'decisions that align with care standards',
  'a key factor for leaders to succeed': 'something many leaders rely on',
  'demanding environments': 'high-pressure or emotionally complex settings',
  'maintain their professional integrity': 'stay grounded in ethical behavior',
  'not only affect the organization\'s performance but also have an impact on patient results': 'improve both organizational performance and patient outcomes',
  'help the organization run better and improve how patients are treated': 'boost organizational efficiency and enhance patient care',
  "rapidly changing world": "as industries keep adapting to new demands",
  "ever-evolving landscape": "as trends continue to change"
};

// Import clean word replacements (no duplicates)
export const wordReplacements = cleanWordReplacements;

// Enhanced verb patterns with comprehensive conjugations
export { verbPatterns } from './cleanwordreplacements.js';

// Apply replacements more aggressively
export function destroyAIWords(text) {
  let result = text;
  
  // Step 1: Apply pattern-based verb replacements
  verbPatterns.patterns.forEach(({ pattern, replacements }) => {
    result = result.replace(pattern, (match) => {
      const lower = match.toLowerCase();
      // Preserve capitalization
      if (replacements[lower]) {
        const replacement = replacements[lower];
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      }
      return match;
    });
  });
  
  // Step 2: Clean up common AI phrases
  const aiPhrases = [
    [/\bin today's world\b/gi, 'now'],
    [/\bplays? a(?:n)? (?:crucial|vital|important) role\b/gi, 'matters'],
    [/\bserves as a\b/gi, 'is a'],
    [/\brepresents a\b/gi, 'is a'],
    [/\b(?:this|that) highlights\b/gi, 'this shows'],
    [/\barray of\b/gi, 'range of'],
    [/\bdiverse (?:array|range) of\b/gi, 'different'],
    [/\bmultifaceted\b/gi, 'complex'],
    [/\bnuanced\b/gi, 'detailed'],
    [/\bprofound\b/gi, 'deep'],
    [/\binvaluable\b/gi, 'useful'],
    [/\binsightful\b/gi, 'helpful'],
    [/\brealm of\b/gi, 'area of'],
    [/\blandscape of\b/gi, 'world of'],
    [/\bjourney of\b/gi, 'process of'],
    [/\bframework for\b/gi, 'way to']
  ];
  
  aiPhrases.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  
  return result;
}

// Integration function for your pipeline
export function cleanAILanguage(text) {
  // First pass: destroy AI words
  let cleaned = destroyAIWords(text);
  
  // Second pass: apply phrase replacements
  Object.entries(phraseReplacements).forEach(([phrase, replacement]) => {
    const regex = new RegExp(phrase, 'gi');
    cleaned = cleaned.replace(regex, replacement);
  });
  
  // Third pass: apply word replacements
  Object.entries(wordReplacements).forEach(([word, replacement]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, (match) => {
      // Preserve capitalization
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  });
  
  return cleaned;
}