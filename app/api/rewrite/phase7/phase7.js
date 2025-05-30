// Fixed Phase 7 - All missing imports added

import { runLanguageToolGrammarCheck } from '@/lib/languagetool.js';
import { removeBannedPhrases } from '@/constants/filters.js';
import { finalPunctuationPass } from '@/lib/finalfix.js';
import { cleanPatterns } from '@/lib/cleanpatterns.js';
import { forceSplitTriplets } from '@/lib/structuretools.js';
import { sanitizeMisusedTransitions } from '@/lib/transitionvalidator.js';
import { cleanAILanguage } from '@/constants/rules.js';
import { applyPhraseReplacements } from '@/constants/filters.js';
import { detectRuleOfThree } from '@/lib/flags.js'; // ADD THIS IMPORT

// 🛑 List of AI-style transitions to block from reappearing
const bannedTransitions = ['However', 'Even so', 'Moreover', 'Nonetheless', 'In conclusion', 'Furthermore'];

// Function to apply phrase replacements
export function patchFragments(text) {
  let result = text;
  
  // Fix standalone "And even nations"
  result = result.replace(/\.\s+And even nations\./gi, ', and even nations.');
  
  // Fix other standalone "And" fragments
  result = result.replace(/\.\s+And ([^.]+)\./gi, ', and $1.');
  
  // Remove extra spaces around periods
  result = result.replace(/\s+\.\s+/g, '. ');
  result = result.replace(/\.\s{2,}/g, '. ');

  // Correct the regex replacement logic
  result = result.replace(/^And\s+([a-z])/i, 'But $1');
  
  // Handle additional specific cases
  const lines = result.split('. ').map(l => l.trim());
  let output = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Filter out ultra-short standalone fragments
    if (line.match(/^Or in a club\.?$/i)) {
      // Detected trash fragment — merge with prior line instead
      if (output.length > 0) {
        output[output.length - 1] += ' or in a club.';
      }
      continue;
    }

    if (
      i < lines.length - 1 &&
      line.match(/statement$/i) &&
      lines[i + 1].match(/^is an important/i)
    ) {
      output.push(`${line} is an important${lines[i + 1].slice(18)}`);
      i++;
    } else {
      output.push(line);
    }
  }

  let modifiedText = output.join('. ') + '.';
  console.log('[Phase 7] ✅ After fragment patcher (final):', modifiedText);
  return modifiedText.replace(/\.{2,}$/, '.');
}

export async function runPhase7(text, detectorTarget = null, field = 'general') {
  try {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.warn('[Phase 7] ❌ Invalid input');
      return { output: '', flags: {} };
    }

    console.log('\n[Phase 7] 🔁 Starting final cleanup...');
    let output = text;
    const flags = {};

    // Apply phrase replacements
    output = applyPhraseReplacements(output);
    console.log('[Phase 7] ✅ After phrase replacements:', output);

    // 1) Banned phrases
    output = removeBannedPhrases(output);
    console.log('[Phase 7] ✅ After banned phrase sweep:', output);

    // 2) Pattern cleaner
    output = cleanPatterns(output);
    console.log('[Phase 7] ✅ After pattern cleaner:', output);

    // 3) Split triplet patterns that AI often creates
    output = forceSplitTriplets(output);
    console.log('[Phase 7] ✅ After triplet splitting:', output);

    // 🛑 BLOCK: Strip any banned AI transitions that came back
    output = removeAITransitions(output);
    console.log('[Phase 7] ✅ After transition blocker (anti-reinsertion):', output);

    // 4) Rule of Three detection - NOW WORKING
    const ruleOfThree = detectRuleOfThree(output);
    if (ruleOfThree.length) {
      flags.ruleOfThree = ruleOfThree;
      console.warn('[Phase 7 ⚠] Rule of Three detected:', ruleOfThree);
    }

    // 5) Emergency duplicate fixing that actually works
    const repeatedWords = findRepeatedWords(output, 2);
    if (repeatedWords.length) {
      flags.duplicateWords = repeatedWords;
      console.warn('[Phase 7 ⚠] Duplicate words detected:', repeatedWords);
      
      // Use the emergency duplicate fixer
      output = emergencyDuplicateFixer(output);
      console.log('[Phase 7] ✅ After emergency duplicate fixing:', output);
    }

    // 6) Grammar check
    output = await runLanguageToolGrammarCheck(output);
    console.log('[Phase 7] ✅ After grammar check:', output);

    // 7) Fragment patcher
    output = patchFragments(output);
    console.log('[Phase 7] ✅ After fragment patcher:', output);

    output = output.replace(/\. Or in a club\.?/gi, ' or in a club.');
    console.log('[Phase 7] ✅ After fragment patcher (2):', output);

    // 8) Misused-transition sanitizer
    output = sanitizeMisusedTransitions(output);
    console.log('[Phase 7] ✅ After transition sanitizer:', output);

    // 9) Final AI word cleanup
    output = cleanAILanguage(output);
    console.log('[Phase 7] ✅ After AI word replacements:', output);

    // 10) Final punctuation + em-dash cleanup
    output = finalPunctuationPass(output).replace(/—/g, ',');
    console.log('[Phase 7 ✅] Final punctuation cleaned:', output);

    // Add enhanced grammar fixes BEFORE the final return:
    output = enhancedGrammarFixes(output);
    const grammarErrors = validateFinalGrammar(output);
    if (grammarErrors.length > 0) {
      console.log('[Phase 7] ⚠️ Grammar validation failed, applying fixes again');
      output = enhancedGrammarFixes(output);
    }

    // 🔒 Final safeguard: remove banned transitions again if any slipped through
    output = removeAITransitions(output);

    return {
      output: output.trim(),
      flags
    };

  } catch (err) {
    console.error('[Phase 7] ❌ Final Cleanup Error:', err);
    return { output: String(text || ''), flags: {} };
  }
}

// 1. Fix the smartWordDeduplication function by removing broken references
function smartWordDeduplication(text) {
  console.log('[Phase 7] 🔄 Starting smart word deduplication...');
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  let processedSentences = [];
  
  sentences.forEach((sentence, sentenceIndex) => {
    console.log(`[Phase 7] Processing sentence ${sentenceIndex + 1}: "${sentence}"`);
    
    const words = sentence.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordCounts = {};
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const duplicates = Object.entries(wordCounts).filter(([word, count]) => count >= 2);
    
    if (duplicates.length > 0) {
      console.log(`[Phase 7] Found duplicates in sentence:`, duplicates);
      
      let processedSentence = sentence;
      
      duplicates.forEach(([word, count]) => {
        console.log(`[Phase 7] 🎯 Processing duplicate: "${word}" (${count}x)`);
        
        // EXPANDED replacement map
        const replacements = {
          'encourage': 'motivate',
          'support': 'assist',
          'handle': 'manage',
          'teams': 'groups',
          'challenges': 'obstacles',
          'environment': 'setting',
          'collaboration': 'teamwork',
          'leadership': 'guidance',
          // ADD THE MISSING ONES FROM YOUR LOGS:
          'nurses': 'healthcare workers',
          'patients': 'individuals',
          'medical': 'healthcare',
          'important': 'crucial',
          'also': 'additionally',
          'their': 'the',
          'with': 'alongside',
          'included': 'covered'
        };
        
        const replacement = replacements[word];
        if (replacement) {
          console.log(`[Phase 7] 📝 Available replacement: "${word}" → "${replacement}"`);
          
          // Replace the SECOND occurrence (keep first)
          let occurrenceCount = 0;
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          
          processedSentence = processedSentence.replace(regex, (match) => {
            occurrenceCount++;
            
            if (occurrenceCount === 2) {
              const finalReplacement = match[0] === match[0].toUpperCase() 
                ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
                : replacement;
              
              console.log(`[Phase 7] ✅ REPLACING occurrence ${occurrenceCount}: "${match}" → "${finalReplacement}"`);
              return finalReplacement;
            }
            
            return match;
          });
        } else {
          console.log(`[Phase 7] ⚠️ No replacement available for "${word}"`);
        }
      });
      
      processedSentences.push(processedSentence);
    } else {
      processedSentences.push(sentence);
    }
  });
  
  return processedSentences.join(' ').replace(/\s{2,}/g, ' ').trim();
}

// 2. Enhanced duplicate fixer that actually works
function emergencyDuplicateFixer(text) {
  console.log('[Phase 7] 🚨 Emergency duplicate fixer...');
  
  let result = text;
  
  // Target the specific duplicates from your logs
  const emergencyReplacements = {
    'support': ['assistance', 'help', 'aid'],
    'nurses': ['healthcare workers', 'medical staff', 'these professionals'],
    'also': ['additionally', 'furthermore', 'as well'],
    'patients': ['individuals', 'people', 'clients'],
    'their': ['the', 'such', 'these'],
    'important': ['crucial', 'vital', 'significant'],
    'medical': ['healthcare', 'clinical', 'health-related'],
    'included': ['covered', 'encompassed', 'involved'],
    'with': ['alongside', 'through', 'via']
  };
  
  Object.entries(emergencyReplacements).forEach(([word, alternatives]) => {
    let occurrenceCount = 0;
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    
    result = result.replace(regex, (match) => {
      occurrenceCount++;
      
      if (occurrenceCount === 2) {
        const replacement = alternatives[0];
        console.log(`[Phase 7] 🔧 Emergency fix: "${match}" → "${replacement}"`);
        return match[0] === match[0].toUpperCase() 
          ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
          : replacement;
      } else if (occurrenceCount === 3) {
        const replacement = alternatives[1] || alternatives[0];
        console.log(`[Phase 7] 🔧 Emergency fix: "${match}" → "${replacement}"`);
        return match[0] === match[0].toUpperCase() 
          ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
          : replacement;
      }
      
      return match;
    });
  });
  
  return result;
}

// Better duplicate detection that catches the actual words
function findRepeatedWords(text, threshold = 2) {
  console.log('[Phase 7] 🔍 Detecting repeated words...');
  
  // Get all words 4+ characters, case-insensitive
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const counts = {};
  
  words.forEach(word => {
    counts[word] = (counts[word] || 0) + 1;
  });
  
  const repeated = Object.entries(counts)
    .filter(([word, count]) => count >= threshold)
    .map(([word, count]) => `${word} (${count}x)`);
  
  console.log('[Phase 7] 📊 Word frequency analysis:', counts);
  console.log('[Phase 7] 🎯 Repeated words found:', repeated);
  
  return repeated;
}

// Function to remove AI-style transitions
function removeAITransitions(text) {
  console.log('[Phase 7] 🔄 Removing AI-style transitions...');
  const transitionsToRemove = [
    'However', 'Even so', 'Moreover', 'Nonetheless', 'In conclusion', 'Furthermore'
  ];
  let result = text;
  transitionsToRemove.forEach(transition => {
    const regex = new RegExp(`\\b${transition}\\b`, 'gi');
    result = result.replace(regex, '');
  });
  console.log('[Phase 7] ✅ Transitions removed:', result);
  return result;
}

// Add comprehensive grammar validation
function validateFinalGrammar(text) {
  const errors = [];
  
  // Check for subject-verb disagreement
  if (/\b(Nurses|Students|Patients|Teams)\s+(matters|learns|needs|works)\b/.test(text)) {
    errors.push('Subject-verb disagreement detected');
  }
  
  // Check for lowercase after periods
  if (/\.\s+[a-z]/.test(text)) {
    errors.push('Lowercase letter after period');
  }
  
  // Check for incorrect articles
  if (/\ba [aeiou]/i.test(text) || /\ban [^aeiou]/i.test(text)) {
    errors.push('Incorrect article usage (a/an)');
  }
  
  // Check for missing spaces after punctuation
  if (/[.,!?][A-Za-z]/.test(text)) {
    errors.push('Missing space after punctuation');
  }
  
  if (errors.length > 0) {
    console.log('[Phase 7] ⚠️ Grammar validation errors:', errors);
  } else {
    console.log('[Phase 7] ✅ Grammar validation passed');
  }
  
  return errors;
}

function enhancedGrammarFixes(text) {
  console.log('[Phase 7] 🔧 Enhanced grammar fixes...');
  let result = text;
  
  // Fix subject-verb agreement errors
  result = result.replace(/\bNurses matters\b/g, 'Nurses matter');
  result = result.replace(/\bStudents learns\b/g, 'Students learn');
  result = result.replace(/\bPatients needs\b/g, 'Patients need');
  result = result.replace(/\bTeams works\b/g, 'Teams work');
  
  // Fix capitalization after periods
  result = result.replace(/\.\s+([a-z])/g, (match, letter) => {
    return '. ' + letter.toUpperCase();
  });
  
  // Fix "a" vs "an" articles
  result = result.replace(/\ba ([aeiou])/gi, 'an $1');
  result = result.replace(/\ban ([^aeiou])/gi, 'a $1');
  
  // Fix comma splices and run-on sentences
  result = result.replace(/([^,\.?!]{30,}?),\s+(?=[A-Z])/g, '$1. ');
  
  // Fix spacing issues
  result = result.replace(/\s{2,}/g, ' ');
  result = result.replace(/\s+([.,!?])/g, '$1');
  result = result.replace(/([.,!?])(?=[^\s])/g, '$1 ');
  
  // Fix specific problematic patterns
  result = result.replace(/\bthe Management\b/g, 'The management');
  result = result.replace(/\bthe System\b/g, 'the system');
  result = result.replace(/\bthe Field\b/g, 'the field');
  
  console.log('[Phase 7] ✅ Enhanced grammar fixes complete');
  return result;
}