// File: app/api/rewrite/phase6_5/phase6_5.js
// Phase 6.5 - Final AI Detection Catcher & Repair System

import { detectAIStyleFlags, isAISafe, detectRuleOfThree } from '@/lib/patterncheck_6_5.js';
import { rewriteStructureOnly } from '@/lib/openaiutils'; 
import { smartClean } from '@/constants/filters.js';

export async function runPhase6_5(text) {
  const threshold = 3;
  const flagCheck = isAISafe(text, threshold);
  
  console.log('[Phase 6.5] 🔍 Starting Final Detection Catcher...');
  
  const individualFlags = detectAIStyleFlags(text); 
  console.log('[Phase 6.5] ⚠️ Detected AI flags:', individualFlags);
  
  const ruleOfThreeMatches = detectRuleOfThree(text); 
  console.log('[Phase 6.5] ⚠️ Detected Rule of Three matches:', ruleOfThreeMatches);
  
  // Combine both types of AI signals for logging
  const combinedFlags = [
    ...individualFlags,
    ...ruleOfThreeMatches.map(match => ({
      type: 'Rule of Three',
      match: match.join(', ')
    }))
  ];

  // If text is considered "safe", apply light cleanup and return
  if (flagCheck.safe && ruleOfThreeMatches.length === 0) {
    console.log('[Phase 6.5] ✅ Text appears safe, applying light cleanup...');
    
    // Apply your comprehensive filters system as safety net
    const lightCleanup = smartClean(text);
    
    return {
      output: lightCleanup,
      metadata: {
        safe: true,
        score: flagCheck.score,
        flagged: combinedFlags,
        reason: 'Passed pattern check, applied light cleanup'
      }
    };
  }

  // If not safe, apply comprehensive filters first
  console.log('[Phase 6.5] 🔧 Text flagged, applying comprehensive cleanup...');
  
  let repairedText = smartClean(text);
  console.log('[Phase 6.5] ✅ Applied smartClean filters');

  // If still has major issues after filters, use GPT-4 as backup
  const postFilterCheck = isAISafe(repairedText, threshold);
  const postFilterRuleOfThree = detectRuleOfThree(repairedText);
  
  if (!postFilterCheck.safe || postFilterRuleOfThree.length > 0) {
    console.log('[Phase 6.5] 🚨 Still flagged after filters, using GPT-4 backup...');
    
    const detoxPrompt = `Your job is to rewrite this paragraph to eliminate AI-detection patterns including robotic tone, overly formal transitions, and repetitive structures like the 'rule of three' (e.g. lists of 3 items like "policy, practice, and planning"). Keep the meaning, but make it sound natural and human.

Original paragraph:
"""
${repairedText}
"""

Now rewrite it below:`;

    try {
      const messages = [
        {
          role: 'system',
          content: "Your job is to rewrite this paragraph to eliminate AI-detection patterns including robotic tone, overly formal transitions, and repetitive structures like the 'rule of three' (e.g. lists of 3 items like 'policy, practice, and planning'). Keep the meaning, but make it sound natural and human."
        },
        {
          role: 'user',
          content: `"""${repairedText}"""`
        }
      ];

      const gptRewrite = await rewriteStructureOnly({
        model: 'gpt-4-0613',
        temperature: 0.4,
        max_tokens: 500,
        messages
      });

      if (gptRewrite && gptRewrite.trim()) {
        repairedText = gptRewrite;
        console.log('[Phase 6.5] ✅ GPT-4 backup rewrite applied');
      }

    } catch (error) {
      console.error('[Phase 6.5] ❌ GPT-4 backup failed:', error);
      // Continue with filter-cleaned version
    }
  }

  // Final safety check
  const finalFlags = detectAIStyleFlags(repairedText);
  const finalRuleOfThree = detectRuleOfThree(repairedText);
  const finalCombinedFlags = [
    ...finalFlags,
    ...finalRuleOfThree.map(match => ({
      type: 'Rule of Three',
      match: match.join(', ')
    }))
  ];

  console.log('[Phase 6.5] ✅ Final cleanup complete');
  console.log('[Phase 6.5] 📊 Final flags:', finalCombinedFlags.length);

  return {
    output: repairedText,
    metadata: {
      safe: finalCombinedFlags.length === 0,
      originalScore: flagCheck.score,
      flagged: combinedFlags,
      finalFlags: finalCombinedFlags,
      reason: 'Applied comprehensive filters + GPT-4 backup if needed',
      repairsApplied: true,
      filtersUsed: true,
      gptBackupUsed: !postFilterCheck.safe || postFilterRuleOfThree.length > 0
    }
  };
}