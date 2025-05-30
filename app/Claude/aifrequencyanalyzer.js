// File: app/lib/aiWordFrequencyAnalyzer.js

export class AIWordFrequencyAnalyzer {
  constructor() {
    // Pre-loaded frequency data (in production, this would come from a database)
    this.wordFrequencies = new Map([
      // Format: [word, { aiFreq: relative AI frequency, humanFreq: 1 (baseline), ratio: aiFreq/humanFreq }]
      ['delve', { aiFreq: 12, humanFreq: 1, ratio: 12 }],
      ['showcase', { aiFreq: 9, humanFreq: 1, ratio: 9 }],
      ['foster', { aiFreq: 8, humanFreq: 1, ratio: 8 }],
      ['vital', { aiFreq: 7, humanFreq: 1, ratio: 7 }],
      ['crucial', { aiFreq: 7, humanFreq: 1, ratio: 7 }],
      ['essential', { aiFreq: 7, humanFreq: 1, ratio: 7 }],
      ['comprehensive', { aiFreq: 7, humanFreq: 1, ratio: 7 }],
      ['facilitate', { aiFreq: 6, humanFreq: 1, ratio: 6 }],
      ['enhance', { aiFreq: 6, humanFreq: 1, ratio: 6 }],
      ['leverage', { aiFreq: 6, humanFreq: 1, ratio: 6 }],
      ['multifaceted', { aiFreq: 5, humanFreq: 1, ratio: 5 }],
      ['moreover', { aiFreq: 5, humanFreq: 1, ratio: 5 }],
      ['furthermore', { aiFreq: 5, humanFreq: 1, ratio: 5 }],
      ['underscore', { aiFreq: 5, humanFreq: 1, ratio: 5 }],
      ['pivotal', { aiFreq: 5, humanFreq: 1, ratio: 5 }],
      ['utilize', { aiFreq: 4.5, humanFreq: 1, ratio: 4.5 }],
      ['implement', { aiFreq: 4, humanFreq: 1, ratio: 4 }],
      ['robust', { aiFreq: 4, humanFreq: 1, ratio: 4 }],
      ['innovative', { aiFreq: 4, humanFreq: 1, ratio: 4 }],
      ['strategic', { aiFreq: 3.5, humanFreq: 1, ratio: 3.5 }],
      ['optimize', { aiFreq: 3.5, humanFreq: 1, ratio: 3.5 }],
      ['holistic', { aiFreq: 3.5, humanFreq: 1, ratio: 3.5 }],
      ['stakeholder', { aiFreq: 3, humanFreq: 1, ratio: 3 }],
      ['synergy', { aiFreq: 3, humanFreq: 1, ratio: 3 }],
      
      // Human-preferred alternatives (ratio <= 2)
      ['explore', { aiFreq: 2, humanFreq: 1, ratio: 2 }],
      ['look into', { aiFreq: 1.5, humanFreq: 1, ratio: 1.5 }],
      ['examine', { aiFreq: 1.8, humanFreq: 1, ratio: 1.8 }],
      ['study', { aiFreq: 1.2, humanFreq: 1, ratio: 1.2 }],
      ['check', { aiFreq: 0.8, humanFreq: 1, ratio: 0.8 }],
      ['help', { aiFreq: 1, humanFreq: 1, ratio: 1 }],
      ['support', { aiFreq: 1.5, humanFreq: 1, ratio: 1.5 }],
      ['encourage', { aiFreq: 1.8, humanFreq: 1, ratio: 1.8 }],
      ['build', { aiFreq: 1.2, humanFreq: 1, ratio: 1.2 }],
      ['important', { aiFreq: 2, humanFreq: 1, ratio: 2 }],
      ['key', { aiFreq: 1.5, humanFreq: 1, ratio: 1.5 }],
      ['needed', { aiFreq: 1.3, humanFreq: 1, ratio: 1.3 }],
      ['main', { aiFreq: 1.1, humanFreq: 1, ratio: 1.1 }],
      ['improve', { aiFreq: 1.5, humanFreq: 1, ratio: 1.5 }],
      ['boost', { aiFreq: 1.2, humanFreq: 1, ratio: 1.2 }],
      ['strengthen', { aiFreq: 1.8, humanFreq: 1, ratio: 1.8 }],
      ['use', { aiFreq: 0.9, humanFreq: 1, ratio: 0.9 }],
      ['apply', { aiFreq: 1.6, humanFreq: 1, ratio: 1.6 }],
      ['complex', { aiFreq: 2, humanFreq: 1, ratio: 2 }],
      ['varied', { aiFreq: 1.4, humanFreq: 1, ratio: 1.4 }],
      ['also', { aiFreq: 1.2, humanFreq: 1, ratio: 1.2 }],
      ['plus', { aiFreq: 0.8, humanFreq: 1, ratio: 0.8 }],
      ['and', { aiFreq: 1, humanFreq: 1, ratio: 1 }],
      ['stress', { aiFreq: 1.3, humanFreq: 1, ratio: 1.3 }],
      ['central', { aiFreq: 1.7, humanFreq: 1, ratio: 1.7 }],
    ]);

    // Replacement mapping based on meaning groups
    this.replacementGroups = {
      'explore_group': {
        highAI: ['delve', 'explore deeply', 'dive into'],
        lowAI: ['look into', 'examine', 'study', 'check', 'review']
      },
      'support_group': {
        highAI: ['foster', 'cultivate', 'nurture'],
        lowAI: ['support', 'encourage', 'help', 'build', 'develop']
      },
      'important_group': {
        highAI: ['vital', 'crucial', 'essential', 'pivotal', 'paramount'],
        lowAI: ['important', 'key', 'needed', 'main', 'central', 'critical']
      },
      'improve_group': {
        highAI: ['enhance', 'optimize', 'elevate', 'augment'],
        lowAI: ['improve', 'boost', 'strengthen', 'better', 'upgrade']
      },
      'use_group': {
        highAI: ['leverage', 'utilize', 'employ', 'harness'],
        lowAI: ['use', 'apply', 'work with', 'put to use']
      },
      'complex_group': {
        highAI: ['multifaceted', 'comprehensive', 'holistic', 'intricate'],
        lowAI: ['complex', 'detailed', 'thorough', 'complete', 'full']
      },
      'addition_group': {
        highAI: ['moreover', 'furthermore', 'additionally'],
        lowAI: ['also', 'plus', 'and', 'as well', 'too']
      },
      'emphasize_group': {
        highAI: ['underscore', 'highlight', 'accentuate'],
        lowAI: ['stress', 'point out', 'note', 'emphasize', 'show']
      },
      'show_group': {
        highAI: ['showcase', 'demonstrate', 'illustrate'],
        lowAI: ['show', 'display', 'present', 'reveal']
      },
      'strong_group': {
        highAI: ['robust', 'resilient', 'formidable'],
        lowAI: ['strong', 'solid', 'sturdy', 'tough']
      }
    };

    this.aiThreshold = 3; // Words with ratio >= 3 are considered "too AI"
    this.humanThreshold = 2; // Prefer words with ratio <= 2
  }

  // Calculate AI score for a text
  calculateAIScore(text) {
    const words = text.toLowerCase().split(/\s+/);
    let totalScore = 0;
    let wordCount = 0;
    let aiWordCount = 0;
    const detectedAIWords = [];

    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      const freq = this.wordFrequencies.get(cleanWord);
      if (freq) {
        totalScore += freq.ratio;
        wordCount++;
        if (freq.ratio >= this.aiThreshold) {
          aiWordCount++;
          detectedAIWords.push(cleanWord);
        }
      }
    });

    return {
      averageRatio: wordCount > 0 ? totalScore / wordCount : 0,
      aiWordCount,
      aiWordPercentage: (aiWordCount / words.length) * 100,
      isLikelyAI: wordCount > 0 && (totalScore / wordCount) >= this.aiThreshold,
      detectedAIWords
    };
  }

  // Add the missing analyzeText method (alias for calculateAIScore with additional info)
  analyzeText(text) {
    const score = this.calculateAIScore(text);
    return {
      ...score,
      aiWords: score.detectedAIWords, // Alias for compatibility
      totalWords: text.split(/\s+/).length,
      recommendation: score.averageRatio >= this.aiThreshold ? 'Replace AI words' : 'Text looks human'
    };
  }

  // Find the best replacement for an AI word
  findBestReplacement(word) {
    const wordLower = word.toLowerCase();
    
    // Find which group this word belongs to
    for (const [groupName, group] of Object.entries(this.replacementGroups)) {
      if (group.highAI.includes(wordLower)) {
        // Pick a random low-AI alternative from the same meaning group
        const alternatives = group.lowAI.filter(alt => {
          const altFreq = this.wordFrequencies.get(alt);
          return altFreq && altFreq.ratio <= this.humanThreshold;
        });
        
        if (alternatives.length > 0) {
          // Return random alternative to avoid repetition
          return alternatives[Math.floor(Math.random() * alternatives.length)];
        }
      }
    }
    
    // If no group found, return original
    return wordLower;
  }

  // Replace AI words in text with options
  replaceAIWords(text, options = {}) {
    const {
      aggressiveness = 'medium',
      preserveCapitalization = true
    } = options;

    // Adjust threshold based on aggressiveness
    let threshold = this.aiThreshold;
    if (aggressiveness === 'low') threshold = 5;
    else if (aggressiveness === 'high') threshold = 2.5;

    let result = text;
    const replacements = [];

    // Sort by length (longest first) to handle phrases before individual words
    const sortedWords = Array.from(this.wordFrequencies.entries())
      .filter(([word, freq]) => freq.ratio >= threshold)
      .sort((a, b) => b[0].length - a[0].length);

    sortedWords.forEach(([aiWord, freq]) => {
      const regex = new RegExp(`\\b${aiWord}\\b`, 'gi');
      
      result = result.replace(regex, (match) => {
        const replacement = this.findBestReplacement(aiWord);
        
        // Preserve capitalization if requested
        const finalReplacement = preserveCapitalization && match[0] === match[0].toUpperCase() 
          ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
          : replacement;
        
        replacements.push({
          original: match,
          replacement: finalReplacement,
          ratio: freq.ratio
        });
        
        return finalReplacement;
      });
    });

    return {
      text: result,
      replacements,
      originalScore: this.calculateAIScore(text),
      newScore: this.calculateAIScore(result)
    };
  }
}

// Export singleton instance
export const aiWordAnalyzer = new AIWordFrequencyAnalyzer();

// Integration with your pipeline
export function smartAIReplace(text) {
  const result = aiWordAnalyzer.replaceAIWords(text);
  
  console.log(`[AI Word Replacer] Original AI Score: ${result.originalScore.averageRatio.toFixed(2)}`);
  console.log(`[AI Word Replacer] New AI Score: ${result.newScore.averageRatio.toFixed(2)}`);
  console.log(`[AI Word Replacer] Replacements made:`, result.replacements);
  
  return result.text;
}