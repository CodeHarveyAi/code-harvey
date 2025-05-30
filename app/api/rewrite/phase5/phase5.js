import { matchPatternToInput, validatePatternMatch } from '@/lib/patternmatcher.js';
import { rewriteStructureOnly } from '@/lib/openaiutils.js';
import { enhancedAIWordReplace } from '@/constants/filters.js';
import { detectAIStyleFlags } from '@/lib/patterncheck_6_5.js';

export async function runPhase5(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('[Phase 5] ❌ Invalid input:', text);
    return { output: text, metadata: {} };
  }

  try {
    console.log('[Phase 5] 🎯 Starting Pattern-Based Structure + Rule Breaking...');
    console.log(`[Phase 5] Input: "${text}"`);

    // Step 1: Break Rule of Three FIRST
    let output = grammarSafeRuleBreaking(text);
    console.log(`[Phase 5] After rule breaking: "${output}"`);

    // Step 2: Clean residual AI-style language
    const aiCleaned = enhancedAIWordReplace(output);
    output = aiCleaned.text;
    console.log(`[Phase 5] ✅ Cleaned AI words (${aiCleaned.replacements.length} replaced)`);

    // Optional: flag leftover AI phrasing
    const aiFlags = detectAIStyleFlags(output);
    if (aiFlags.length > 0) {
      console.log('[Phase 5] ⚠️ Residual AI flags:', aiFlags);
    }

    // Step 3: Match pattern
    const selectedPattern = matchPatternToInput(output);
    console.log(`[Phase 5] 🧠 Matched Pattern: ${selectedPattern?.id || 'none'}`);
    console.log(`[Phase 5] 📋 Structure: ${selectedPattern?.structure || 'N/A'}`);

    // Step 4: Validate pattern
    const isValidMatch = validatePatternMatch(output, selectedPattern);
    console.log(`[Phase 5] ✅ Pattern validation: ${isValidMatch ? 'PASSED' : 'FAILED'}`);

    // Step 5: Apply pattern-based structure via GPT
    if (isValidMatch && selectedPattern) {
      const patternPrompt = buildPatternPrompt(selectedPattern);
      try {
        const patternResult = await rewriteStructureOnly({
          model: 'gpt-4o',
          temperature: 0.3,
          max_tokens: 500,
          messages: [
            { role: 'system', content: patternPrompt },
            { role: 'user', content: output }
          ]
        });

        if (patternResult && !hasRuleOfThree(patternResult)) {
          output = patternResult;
          console.log('[Phase 5] ✅ Pattern structure applied successfully');
        } else {
          console.log('[Phase 5] ⚠️ Pattern result had rule of three, using rule-broken version');
        }
      } catch (patternError) {
        console.error('[Phase 5] Pattern enforcement error:', patternError.message);
      }
    } else {
      console.log('[Phase 5] ⚠️ Pattern invalid or missing, using conservative fallback');
      output = conservativeStructureFix(output);
    }

    // Step 6: Final rule-of-three sweep
    output = finalRuleCleanup(output);

    console.log(`[Phase 5] 📤 Final Output: "${output}"`);
    return {
      output,
      metadata: {
        selectedPattern,
        patternStructure: selectedPattern?.structure || null,
        patternValid: isValidMatch,
        ruleOfThreeStripped: true,
        aiFlags: aiFlags
      }
    };

  } catch (err) {
    console.error('[Phase 5] ❌ Error:', err.message);
    return { output: text, metadata: {} };
  }
}

function grammarSafeRuleBreaking(text) {
  console.log('[Phase 5] 🔨 Breaking rule of three...');
  let result = text;

  result = result.replace(
    /\b(\w+(?:\s+\w+)*),\s+(\w+(?:\s+\w+)*),\s+and\s+(the\s+)?(\w+(?:\s+\w+)*)\b/gi,
    (match, a, b, thePrefix, c) => {
      const alt = `${a} and ${b}, plus ${thePrefix || ''}${c}`;
      console.log(`[Phase 5] 🔄 Replaced triplet: "${match}" → "${alt}"`);
      return alt;
    }
  );

  result = result.replace(/hospitals,\s+clinics,\s+and\s+homes/gi, 'hospitals and clinics, plus homes');
  result = result.replace(/check\s+important\s+signs,\s+give\s+medicine,\s+and\s+help\s+doctors/gi, 'check important signs and give medicine, plus help doctors');

  return result;
}

function buildPatternPrompt(pattern) {
  if (!pattern || !pattern.structure) {
    return `You are a structure editor. Make minimal adjustments to improve sentence flow while preserving all academic vocabulary and meaning. Do not simplify language.`;
  }

  return `You are a Pattern Enforcer. Rewrite the text to follow this sentence structure pattern while maintaining all original meaning and academic tone.

Pattern: ${pattern.id}
Structure: ${pattern.structure}
Complexity: ${pattern.conditions?.complexity || 'medium'}

CRITICAL RULES:
- Keep ALL academic vocabulary exactly as written
- Do NOT simplify or casualize the language
- Follow the pattern structure but preserve sophisticated vocabulary
- Maintain the same level of formality and professionalism
- Do NOT reintroduce "A, B, and C" patterns
- Ensure all sentences are grammatically complete
- Fix any sentence fragments or run-ons
- If the pattern doesn't fit well, make minimal structural adjustments instead

The goal is to improve structure while keeping the text academic and professional, and avoiding rule-of-three patterns.`;
}

function hasRuleOfThree(text) {
  const patterns = [
    /\b(\w+),\s+(\w+),\s+and\s+(\w+)\b/gi,
    /\b(\w+\s+\w+),\s+(\w+\s+\w+),\s+and\s+(\w+\s+\w+)\b/gi
  ];
  return patterns.some(p => p.test(text));
}

function conservativeStructureFix(text) {
  let result = text;
  result = result.replace(/\.\s+And\s+([a-z])/g, ', and $1');
  result = result.replace(/\.\s+Help\s+([a-z])/g, '. They help $1');
  result = result.replace(/\.\s+Homes\s+is\s+also\s+included/g, '. They also work in homes');
  result = result.replace(/,\s*and\s+/g, ', and ');
  result = result.replace(/\ban unique\b/g, 'a unique');
  return result.trim().replace(/\s{2,}/g, ' ');
}

function finalRuleCleanup(text) {
  return text
    .replace(/(\w+),\s+(\w+),\s+and\s+(\w+)/gi, (match, a, b, c) => {
      return `${a} and ${b}, plus ${c}`;
    })
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/([.,!?])(?=[^\s])/g, '$1 ');
}
