#!/usr/bin/env node
/**
 * extractPatternCLI.js - Extract NEW patterns from text structure
 * This creates patterns instead of matching existing ones
 */

// Redirect console.log to stderr for debugging messages
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function() {
  originalConsoleError.apply(console, arguments);
};

const input = process.argv.slice(2).join(' ');

if (!input || input.length < 10) {
  originalConsoleError("❌ No input provided to pattern extractor.");
  process.exit(1);
}

try {
  originalConsoleError(`Analyzing text: "${input.substring(0, 50)}..."`);
  
  const pattern = extractPatternFromText(input);
  
  if (pattern) {
    // Print ONLY clean JSON to stdout
    process.stdout.write(JSON.stringify(pattern));
  } else {
    originalConsoleError("❌ No pattern could be extracted");
    process.exit(1);
  }
} catch (error) {
  originalConsoleError("❌ Error extracting pattern:", error.message);
  process.exit(1);
}

function extractPatternFromText(text) {
  // Split into sentences
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  
  if (sentences.length === 0) return null;
  
  originalConsoleError(`Found ${sentences.length} sentences`);
  
  // Analyze first sentence structure
  const firstSentence = sentences[0];
  const structure = analyzeGrammaticalStructure(firstSentence);
  
  if (!structure || structure.components.length < 2) {
    originalConsoleError("❌ Structure too simple or undetectable");
    return null;
  }
  
  // Generate unique pattern ID
  const patternId = generateUniquePatternId(structure, sentences.length);
  
  // Determine complexity
  const complexity = determineComplexity(structure, sentences.length, text);
  
  // Detect voice
  const voice = detectVoice(firstSentence);
  
  originalConsoleError(`Extracted pattern: ${structure.pattern}`);
  
  return {
    id: patternId,
    label: generateLabel(structure, sentences.length),
    structure: structure.pattern,
    conditions: {
      complexity: complexity,
      sentenceCount: sentences.length,
      voice: voice
    },
    examples: [text.length > 100 ? text.substring(0, 100) + "..." : text],
    metadata: {
      wordCount: text.split(/\s+/).length,
      timestamp: new Date().toISOString(),
      extractedFrom: "real-text-analysis"
    }
  };
}

function analyzeGrammaticalStructure(sentence) {
  const components = [];
  const positions = [];
  
  // Clean the sentence
  const clean = sentence.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const words = clean.split(/\s+/);
  
  originalConsoleError(`Analyzing: "${sentence}"`);
  
  // Detect sentence starters
  const firstWord = words[0];
  if (['although', 'because', 'since', 'when', 'while', 'after', 'before'].includes(firstWord)) {
    components.push('Subordinate Clause');
    positions.push(0);
  } else if (['to'].includes(firstWord) && words.length > 1) {
    components.push('Infinitive Phrase');
    positions.push(0);
  } else if (firstWord.endsWith('ing')) {
    components.push('Gerund Phrase');
    positions.push(0);
  } else if (['the', 'a', 'an', 'this', 'that', 'these', 'those'].includes(firstWord)) {
    components.push('Noun Phrase');
    positions.push(0);
  } else {
    components.push('Subject');
    positions.push(0);
  }
  
  // Detect verbs (simple heuristic)
  const verbPatterns = /\b(is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|can|could|should|must|may|might)\b/;
  if (verbPatterns.test(sentence)) {
    components.push('Verb');
  }
  
  // Detect auxiliary + past participle (passive voice)
  const passivePattern = /\b(is|was|were|been|being)\s+\w+ed\b/;
  if (passivePattern.test(sentence)) {
    components.push('Passive Verb');
  }
  
  // Detect objects/complements
  const objectPatterns = /\b(the|a|an)\s+\w+(?:\s+\w+)*(?=\s|$)/g;
  const objectMatches = sentence.match(objectPatterns);
  if (objectMatches && objectMatches.length > 1) {
    components.push('Direct Object');
  }
  
  // Detect prepositional phrases
  const prepPattern = /\b(in|on|at|by|for|with|from|to|of|about|through|during|before|after|under|over|between|among)\s+/g;
  const prepMatches = sentence.match(prepPattern);
  if (prepMatches) {
    components.push('Prepositional Phrase');
  }
  
  // Detect conjunctions
  if (/\b(and|but|or|so|yet|for|nor)\b/.test(sentence)) {
    components.push('Conjunction');
  }
  
  // Detect relative clauses
  if (/\b(who|which|that|where|when|whose)\b/.test(sentence)) {
    components.push('Relative Clause');
  }
  
  // Detect infinitive phrases
  if (/\bto\s+\w+/.test(sentence)) {
    components.push('Infinitive Phrase');
  }
  
  // Detect adverbial phrases
  if (/\b(quickly|slowly|carefully|effectively|successfully|clearly|obviously)\b/.test(sentence)) {
    components.push('Adverb');
  }
  
  // Remove duplicates while preserving order
  const uniqueComponents = [...new Set(components)];
  
  return {
    components: uniqueComponents,
    pattern: uniqueComponents.join(' + '),
    complexity: uniqueComponents.length
  };
}

function generateUniquePatternId(structure, sentenceCount) {
  // Create a descriptive ID based on structure
  const key = structure.components
    .map(c => c.toLowerCase().replace(/\s+/g, '_'))
    .join('_');
  
  // Add sentence count for uniqueness
  const base = `${key}_${sentenceCount}sent`;
  
  // Simple hash function (no crypto module needed)
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string
  const hashStr = Math.abs(hash).toString(16).substring(0, 8);
  
  return `pattern_${hashStr}`;
}

function generateLabel(structure, sentenceCount) {
  const components = structure.components;
  
  if (sentenceCount === 1) {
    if (components.length <= 2) {
      return components.join(' + ');
    } else {
      return `${components.slice(0, 2).join(' + ')} + ...`;
    }
  } else {
    return `Multi-sentence: ${components.slice(0, 2).join(' + ')} + ...`;
  }
}

function determineComplexity(structure, sentenceCount, fullText) {
  let complexityScore = 0;
  
  // Base complexity from components
  complexityScore += structure.components.length;
  
  // Sentence count adds complexity
  complexityScore += sentenceCount;
  
  // Special structures add complexity
  const specialStructures = ['Relative Clause', 'Subordinate Clause', 'Passive Verb', 'Infinitive Phrase'];
  complexityScore += structure.components.filter(c => specialStructures.includes(c)).length * 2;
  
  // Word count adds complexity
  const wordCount = fullText.split(/\s+/).length;
  if (wordCount > 30) complexityScore += 2;
  if (wordCount > 50) complexityScore += 2;
  
  // Determine complexity level
  if (complexityScore <= 4) return 'low';
  if (complexityScore <= 8) return 'medium';
  if (complexityScore <= 12) return 'high';
  return 'expert';
}

function detectVoice(sentence) {
  // Simple passive voice detection
  const passivePattern = /\b(is|was|were|been|being)\s+\w+ed\b/;
  const activePattern = /\b(I|he|she|they|we|the\s+\w+)\s+(run|walk|think|believe|create|make|do|perform)/;
  
  if (passivePattern.test(sentence)) return 'passive';
  if (activePattern.test(sentence)) return 'active';
  return 'mixed';
}