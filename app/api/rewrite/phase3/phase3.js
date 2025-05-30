// Phase 3 - Comprehensive Repetition Destroyer
// Fixes ALL types of repetition: words, phrases, transitions, openers, hedges

import { deduplicateTransitions, deduplicateOpeners } from '@/lib/patterndeduplicators.js';
import { deduplicateHedges } from '@/lib/deduplicatehedges.js';
import { deduplicateLexicon } from '@/lib/deduplicatelexicon.js';
import { breakPacingPatterns } from '@/lib/structuretools.js';


export async function runPhase3(input) {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    console.warn('[Phase 3] Invalid input.');
    return { output: input, metadata: {} };
  }

  console.log('\n[Phase 3] 🔁 Starting Comprehensive Repetition Destroyer...');
  console.log(`[Phase 3] Input: "${input}"`);

  let output = input;
  let changesLog = [];
  
  // STEP 1: Fix word family repetitions (important/importance)
  const wordFamilyResult = fixWordFamilyRepetition(output);
  output = wordFamilyResult.text;
  changesLog.push(`Word families: ${wordFamilyResult.changes} fixes`);
  console.log(`[Phase 3] After word family fixes: "${output}"`);
  
  // STEP 2: Deduplicate transitions (however, furthermore, moreover)
  const beforeTransitions = output;
  output = deduplicateTransitions(output);
  const transitionChanges = beforeTransitions !== output;
  changesLog.push(`Transitions: ${transitionChanges ? 'fixed' : 'none'}`);
  console.log(`[Phase 3] After transition deduplication: "${output}"`);
  
  // STEP 3: Deduplicate sentence openers (it is clear that, one could argue)
  const beforeOpeners = output;
  output = deduplicateOpeners(output);
  const openerChanges = beforeOpeners !== output;
  changesLog.push(`Openers: ${openerChanges ? 'fixed' : 'none'}`);
  console.log(`[Phase 3] After opener deduplication: "${output}"`);
  
  // STEP 4: Deduplicate hedging language (arguably, perhaps, etc.)
  const beforeHedges = output;
  output = deduplicateHedges(output);
  const hedgeChanges = beforeHedges !== output;
  changesLog.push(`Hedges: ${hedgeChanges ? 'fixed' : 'none'}`);
  console.log(`[Phase 3] After hedge deduplication: "${output}"`);
  
  // STEP 5: Deduplicate lexicon (repeated words within proximity)
  const beforeLexicon = output;
  output = deduplicateLexicon(output);
  const lexiconChanges = beforeLexicon !== output;
  changesLog.push(`Lexicon: ${lexiconChanges ? 'fixed' : 'none'}`);
  console.log(`[Phase 3] After lexicon deduplication: "${output}"`);
  
  // STEP 6: Fix sentence opener repetition
  output = fixSentenceOpenerRepetition(output);
  console.log(`[Phase 3] After sentence opener fixes: "${output}"`);
  
  // STEP 7: Fix word repetition within sentences/paragraphs
  output = fixWordRepetitionInProximity(output);
  console.log(`[Phase 3] After proximity word fixes: "${output}"`);
  
  // STEP 8: Break pacing patterns (varied sentence structure)
  const beforePacing = output;
  output = breakPacingPatterns(output);
  const pacingChanges = beforePacing !== output;
  changesLog.push(`Pacing: ${pacingChanges ? 'fixed' : 'none'}`);
  console.log(`[Phase 3] After pacing pattern breaking: "${output}"`);

  const changesMade = input !== output;
  const lengthChange = output.length - input.length;

  console.log(`[Phase 3] ✅ Comprehensive repetition cleanup complete`);
  console.log(`[Phase 3] Changes made: ${changesLog.join(', ')}`);
  console.log(`[Phase 3] Final output: "${output}"`);

  return {
    output: output.trim(),
    metadata: {
      phase: 3,
      purpose: 'Comprehensive Repetition Destroyer',
      originalLength: input.length,
      finalLength: output.length,
      lengthChange: lengthChange,
      changesMade: changesMade,
      changesLog: changesLog,
      timestamp: new Date().toISOString()
    }
  };
}

// Fix word family repetitions (important/importance, support/supportive)
function fixWordFamilyRepetition(text) {
  console.log('[Phase 3] 🔍 Detecting word family repetitions...');
  
  const wordFamilies = {
    // important family
    'important': ['crucial', 'vital', 'essential', 'key'],
    'importance': ['significance', 'value', 'relevance', 'priority'],
    
    // support family  
    'support': ['assist', 'help', 'aid'],
    'supportive': ['helpful', 'encouraging', 'collaborative'],
    
    // lead family
    'lead': ['guide', 'direct', 'manage'],
    'leadership': ['guidance', 'direction', 'management'],
    'leader': ['guide', 'director', 'manager'],
    
    // effective family
    'effective': ['successful', 'efficient', 'capable'],
    'effectiveness': ['success', 'efficiency', 'capability'],
    
    // professional family
    'professional': ['occupational', 'career-related', 'work-related'],
    'profession': ['field', 'occupation', 'career'],
    'professionalism': ['work ethics', 'standards', 'conduct']
  };
  
  let result = text;
  let changes = 0;
  
  // Find and fix family conflicts
  Object.entries(wordFamilies).forEach(([baseWord, alternatives]) => {
    // Find all family members present in text
    const familyWords = [baseWord, ...Object.keys(wordFamilies).filter(w => 
      w.startsWith(baseWord.slice(0, -2)) || baseWord.startsWith(w.slice(0, -2))
    )];
    
    const presentWords = familyWords.filter(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(result);
    });
    
    if (presentWords.length > 1) {
      console.log(`[Phase 3] 🎯 Found word family conflict: ${presentWords.join(', ')}`);
      
      // Replace the second occurrence with an alternative
      const secondWord = presentWords[1];
      const replacement = alternatives[0];
      
      if (replacement) {
        let occurrenceCount = 0;
        const regex = new RegExp(`\\b${secondWord}\\b`, 'gi');
        
        result = result.replace(regex, (match) => {
          occurrenceCount++;
          if (occurrenceCount === 1) {
            return match; // Keep first occurrence
          } else {
            changes++;
            console.log(`[Phase 3] 🔄 Replacing "${match}" with "${replacement}"`);
            return match[0] === match[0].toUpperCase() 
              ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
              : replacement;
          }
        });
      }
    }
  });
  
  return { text: result, changes };
}

// Fix sentence opener repetition
function fixSentenceOpenerRepetition(text) {
  console.log('[Phase 3] 🔍 Fixing sentence opener repetition...');
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  const openerMap = {};
  const result = [];
  
  const alternatives = {
    'The': ['This', 'That', 'Such'],
    'It': ['This', 'That', 'Such work'],
    'They': ['These individuals', 'Such people', 'These professionals'],
    'This': ['Such', 'That', 'The'],
    'These': ['Such', 'Those', 'The'],
    'Nursing': ['The profession', 'This field', 'Such work'],
    'Nurses': ['These professionals', 'Such individuals', 'Healthcare workers']
  };
  
  sentences.forEach((sentence, index) => {
    const opener = sentence.split(/\s+/)[0];
    
    if (openerMap[opener]) {
      // This opener was used before, replace it
      const replacement = alternatives[opener]?.[0] || opener;
      const newSentence = sentence.replace(opener, replacement);
      result.push(newSentence);
      console.log(`[Phase 3] 🔄 Replaced opener "${opener}" with "${replacement}"`);
    } else {
      result.push(sentence);
      openerMap[opener] = index;
    }
  });
  
  return result.join(' ');
}

// Fix word repetition within sentences/paragraphs
function fixWordRepetitionInProximity(text) {
  console.log('[Phase 3] 🔍 Enhanced word repetition fixing...');
  
  // Step 1: Auto-detect ALL repeated words (4+ chars, 2+ occurrences)
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordCounts = {};
  const wordPositions = {};
  
  // Count occurrences and track positions
  words.forEach((word, index) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
    if (!wordPositions[word]) wordPositions[word] = [];
    wordPositions[word].push(index);
  });
  
  // Find words that appear 2+ times
  const duplicates = Object.entries(wordCounts)
    .filter(([word, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]); // Sort by frequency, highest first
  
  console.log('[Phase 3] 📊 Found duplicates:', duplicates.map(([word, count]) => `${word}(${count}x)`));
  
  // Step 2: Enhanced synonym map with alternatives
  const synonymMap = {
    // Original mappings
    'profession': ['field', 'occupation', 'career'],
    'care': ['treatment', 'assistance', 'attention'], 
    'support': ['assistance', 'help', 'aid', 'backing'],
    'patient': ['individual', 'person', 'client'],
    'health': ['wellness', 'wellbeing', 'medical care'],
    'work': ['function', 'operate', 'collaborate'],
    'team': ['group', 'unit', 'staff'],
    'system': ['framework', 'structure', 'organization'],
    'practice': ['work', 'profession', 'application'],
    'education': ['training', 'instruction', 'learning'],
    'management': ['oversight', 'handling', 'coordination'],
    'skills': ['abilities', 'capabilities', 'competencies'],
    'knowledge': ['expertise', 'understanding', 'know-how'],
    
    // Missing critical words that caused the problem
    'important': ['crucial', 'vital', 'significant', 'essential', 'key'],
    'also': ['additionally', 'furthermore', 'as well', 'moreover'],
    'ensure': ['guarantee', 'maintain', 'secure', 'establish'],
    'complete': ['comprehensive', 'full', 'thorough', 'total'],
    'continuous': ['ongoing', 'constant', 'persistent', 'sustained'],
    'quality': ['high-standard', 'excellent', 'superior', 'effective'],
    'focus': ['concentrate', 'center', 'emphasize', 'target'],
    'provide': ['offer', 'supply', 'deliver', 'give'],
    'include': ['encompass', 'contain', 'involve', 'comprise']
  };
  
  let result = text;
  
  // Step 3: Replace duplicates using synonym map
  duplicates.forEach(([word, count]) => {
    if (synonymMap[word]) {
      const synonyms = synonymMap[word];
      console.log(`[Phase 3] 🎯 Processing "${word}" (${count}x) with synonyms:`, synonyms);
      
      let occurrenceCount = 0;
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      
      result = result.replace(regex, (match, offset, string) => {
        occurrenceCount++;
        
        // Keep first occurrence, replace subsequent ones
        if (occurrenceCount > 1) {
          const synonymIndex = (occurrenceCount - 2) % synonyms.length;
          const replacement = synonyms[synonymIndex];
          
          console.log(`[Phase 3] 🔄 Replacing occurrence ${occurrenceCount}: "${match}" → "${replacement}"`);
          
          // Preserve capitalization
          return match[0] === match[0].toUpperCase() 
            ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
            : replacement;
        }
        
        return match;
      });
    } else {
      console.log(`[Phase 3] ⚠️ No synonyms available for "${word}" (${count}x)`);
      
      // For words without synonyms, use generic strategy
      if (count >= 3) {
        console.log(`[Phase 3] 🚨 High repetition detected for "${word}" - consider adding to synonym map`);
      }
    }
  });
  
  // Step 4: Verify fixes worked
  const afterWords = result.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const afterCounts = {};
  afterWords.forEach(word => {
    afterCounts[word] = (afterCounts[word] || 0) + 1;
  });
  
  const remainingDuplicates = Object.entries(afterCounts)
    .filter(([word, count]) => count >= 2);
  
  if (remainingDuplicates.length > 0) {
    console.log('[Phase 3] ⚠️ Still have duplicates after processing:', remainingDuplicates);
  } else {
    console.log('[Phase 3] ✅ All duplicates resolved');
  }
  
  return result;
}