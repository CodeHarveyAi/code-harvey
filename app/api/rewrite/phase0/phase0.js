// ✅ File: /app/api/rewrite/phase0/phase0.js
import { matchPatternToInput, validatePatternMatch } from '@/lib/patternmatcher.js';
import { HybridAIReplacer } from '@/Claude/hybridaireplacer.js';
import { AIWordDatabaseUpdater } from '@/Claude/aidatabaseupdater.js';
import { SemanticPreservingReplacer } from '@/lib/semanticpreservation.js';

/** Strip first-person per Harvey Protocol */
function stripFirstPerson(text) {
  return text
    .replace(/\bwe\b/gi, 'people')
    .replace(/\bour\b/gi, 'the')
    .replace(/\bus\b/gi, 'them')
    .replace(/\blet['']s\b/gi, '')
    .replace(/\bwe're\b/gi, 'they are')
    .replace(/\bwe've\b/gi, 'they have')
    .replace(/\bwe'll\b/gi, 'they will')
    .replace(/\bwe'd\b/gi, 'they would');
}

/** Replace em-dashes with commas */
function sanitizePunctuation(text) {
  return text.replace(/—/g, ',');
}

/** Enhanced AI word detection and replacement */
function enhancedAIWordReplace(text) {
  const aiWordMap = {
    // Words that weren't caught in the original
    'multifaceted': 'complex',
    'encompasses': 'includes', 
    'cultivates': 'builds',
    'articulates': 'communicates',
    'embodies': 'shows',
    'leverage': 'use',
    'enable': 'allow',
    'achieving': 'reaching',
    'maintaining': 'keeping',
    'possess': 'have',
    'combination': 'mix',
    'qualities': 'traits',
    'extends': 'goes',
    'authority': 'power',
    'inspire': 'motivate',
    'navigate': 'handle',
    
    // Additional AI words
    'facilitate': 'help',
    'demonstrate': 'show',
    'utilize': 'use',
    'implement': 'apply',
    'enhance': 'improve',
    'comprehensive': 'complete',
    'strategic': 'planned',
    'robust': 'strong',
    'innovative': 'new',
    'optimize': 'improve',
    'crucial': 'important',
    'vital': 'important',
    'essential': 'needed',
    'pivotal': 'key',
    'significant': 'important',
    'substantial': 'large',
    'considerable': 'large',
    'moreover': 'also',
    'furthermore': 'also',
    'additionally': 'also',
    'therefore': 'so',
    'consequently': 'as a result',
    'subsequently': 'then',
    'nevertheless': 'however'
  };

  let result = text;
  let replacementCount = 0;
  const replacements = [];

  // Apply word-level replacements with proper case preservation
  Object.entries(aiWordMap).forEach(([aiWord, humanWord]) => {
    const regex = new RegExp(`\\b${aiWord}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      replacementCount++;
      replacements.push({
        original: match,
        replacement: match[0] === match[0].toUpperCase() 
          ? humanWord.charAt(0).toUpperCase() + humanWord.slice(1)
          : humanWord
      });
      
      return match[0] === match[0].toUpperCase() 
        ? humanWord.charAt(0).toUpperCase() + humanWord.slice(1)
        : humanWord;
    });
  });

  console.log(`[Phase 0] Enhanced AI word replacement: ${replacementCount} words replaced`);
  
  return { text: result, replacements };
}

console.log('Sanitize punctuation function loaded');

export async function runPhase0(text) {
  try {
    if (!text || typeof text !== 'string' || !text.trim()) {
      console.warn('[Phase 0] ❌ Invalid input');
      throw new Error('Phase 0 received invalid input');
    }
    console.log('\n[Phase 0] 🔁 Starting Phase 0...');

    // Pre-clean UI quirks
    let cleaned = sanitizePunctuation(text).trim();
    cleaned = stripFirstPerson(cleaned);

    console.log('[Phase 0] 🔁 Input cleaned');
    
    // ENHANCED: Apply immediate AI word replacement
    const enhancedResult = enhancedAIWordReplace(cleaned);
    cleaned = enhancedResult.text;
    console.log(`[Phase 0] ✅ Enhanced replacement applied: ${enhancedResult.replacements.length} words`);

    // Hybrid AI replacement (as backup/additional)
    const replacer = new HybridAIReplacer(process.env.CLAUDE_API_KEY);

    const aiResult = await replacer.processText(cleaned, {
      mode: 'auto',
      aggressiveness: 'medium',
      showAnalysis: true,
      preserveTechnicalTerms: true,
      maintainTone: true
    });

    console.log('[Phase 0] ✅ AI replacement complete');

    // Combine replacements
    const allReplacements = [
      ...enhancedResult.replacements,
      ...aiResult.replacements
    ];

    // Step 3a: Log replacements to database
    if (allReplacements && allReplacements.length > 0) {
      try {
        const dbUpdater = new AIWordDatabaseUpdater();
        await dbUpdater.logReplacements(allReplacements, 'phase0-enhanced');
        console.log('[Phase 0] ✅ Logged replacements to database');
      } catch (dbError) {
        console.error('[Phase 0] Failed to log to database:', dbError);
        // Continue even if database logging fails
      }
    }

    // Semantic preservation
    const semanticReplacer = new SemanticPreservingReplacer();
    const semanticResult = semanticReplacer.replaceWithContext(aiResult.text, {
      preserveKeyMeaning: true,
      maxSemanticLoss: 0.4
    });
    console.log('[Phase 0] ✅ Semantic preservation complete');
    
    // Pattern matching & validation
    let selectedPattern = matchPatternToInput(semanticResult.text);
    if (!validatePatternMatch(semanticResult.text, selectedPattern)) {
      selectedPattern = { /* basicDeclarative fallback */ };
    }

    // Metadata
    const metadata = {
      pattern: selectedPattern.id,
      aiReplacements: allReplacements.length,
      semanticScore: semanticResult.preservedMeaningScore,
      enhancedReplacements: enhancedResult.replacements.length
    };

    // Set output directly from semantic result (no Harvey rewrite)
    let output = semanticResult.text;
    output = stripFirstPerson(output);

    return { output, metadata, analysis: aiResult.analysis };

  } catch (err) {
    console.error('[Phase 0] ❌ Error:', err);
    return { output: text, metadata: {}, analysis: null };
  }
}