// File: app/api/rewrite/phase1/phase1.js
// UPDATED: Pure Grammar Cleanup - No word replacement or structural changes

import { runGrammarCleanup, softGrammarFix, runGrammarFlags } from '@/lib/grammarfix.js';

// Enhanced Phase 1 - Fix actual grammar issues

export async function runPhase1(text) {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) {
      console.warn('[Phase 1] ❌ Invalid input');
      throw new Error('Phase 1 received invalid input');
    }

    console.log('\n[Phase 1] 🔧 Starting Enhanced Grammar Cleanup...');
    console.log(`[Phase 1] Input: "${text}"`);

    let processedText = text;

    // 1. Fix dangling participles (major grammar issue)
    processedText = fixDanglingParticiples(processedText);
    console.log(`[Phase 1] After dangling participle fixes: "${processedText}"`);

    // 2. Light Grammar Cleanup (existing)
    processedText = runGrammarCleanup(processedText);
    console.log(`[Phase 1] After cleanup: "${processedText}"`);

    // 3. Soft Grammar Fixes (existing)
    processedText = softGrammarFix(processedText);
    console.log(`[Phase 1] After soft fixes: "${processedText}"`);

    // 4. Fix obvious syntax issues
    processedText = fixSyntaxIssues(processedText);
    console.log(`[Phase 1] After syntax fixes: "${processedText}"`);

    // 5. Grammar Flagging (optional analysis)
    let grammarFlags = null;
    try {
      grammarFlags = await runGrammarFlags(processedText);
    } catch (flagError) {
      console.error('[Phase 1] Grammar flagging failed:', flagError);
    }

    const changesMade = text !== processedText;
    const lengthDiff = processedText.length - text.length;

    console.log(`[Phase 1] ✅ Enhanced grammar cleanup complete`);
    console.log(`[Phase 1] Final output: "${processedText}"`);

    return {
      output: processedText,
      metadata: {
        phase: 1,
        purpose: 'Enhanced Grammar Cleanup',
        originalLength: text.length,
        finalLength: processedText.length,
        lengthChange: lengthDiff,
        changesMade: changesMade,
        grammarFlags: grammarFlags,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('[Phase 1] ❌ Error:', error);
    return {
      output: text,
      metadata: {
        phase: 1,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Fix dangling participles and similar issues
function fixDanglingParticiples(text) {
  let result = text;
  
  // Fix "X is a Y, focusing on Z" → "X is a Y that focuses on Z"
  result = result.replace(
    /(\w+)\s+is\s+a\s+([^,]+),\s+focusing\s+on\s+(.+?)(\.|,)/gi,
    '$1 is a $2 that focuses on $3$4'
  );
  
  // Fix "X is a Y, emphasizing Z" → "X is a Y that emphasizes Z"
  result = result.replace(
    /(\w+)\s+is\s+a\s+([^,]+),\s+emphasizing\s+(.+?)(\.|,)/gi,
    '$1 is a $2 that emphasizes $3$4'
  );
  
  // Fix "X is a Y, promoting Z" → "X is a Y that promotes Z"
  result = result.replace(
    /(\w+)\s+is\s+a\s+([^,]+),\s+promoting\s+(.+?)(\.|,)/gi,
    '$1 is a $2 that promotes $3$4'
  );
  
  console.log('[Phase 1] 🔧 Fixed dangling participles');
  return result;
}

// Fix other syntax issues
function fixSyntaxIssues(text) {
  let result = text;
  
  // Fix subject-verb disagreement: "Nurses matters" → "Nurses matter"
  result = result.replace(/\bNurses\s+matters\b/gi, 'Nurses matter');
  result = result.replace(/\bLeaders\s+matters\b/gi, 'Leaders matter');
  result = result.replace(/\bPeople\s+matters\b/gi, 'People matter');
  
  // Fix "an important" vs "a important"
  result = result.replace(/\ba\s+important\b/gi, 'an important');
  result = result.replace(/\ban\s+unique\b/gi, 'a unique');
  
  console.log('[Phase 1] 🔧 Fixed syntax issues');
  return result;
}