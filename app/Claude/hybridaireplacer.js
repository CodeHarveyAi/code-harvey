// File: Claude/hybridaireplacer.js
// Updated to work with your frequency analysis system

import { AIWordFrequencyAnalyzer } from './aifrequencyanalyzer.js';
import { EnhancedSmartPipeline } from '../lib/smartPipeline.js';
import { AIWordDatabaseUpdater } from './aidatabaseupdater.js';

export class HybridAIReplacer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.frequencyAnalyzer = new AIWordFrequencyAnalyzer();
    this.smartPipeline = new EnhancedSmartPipeline(apiKey);
    this.dbUpdater = new AIWordDatabaseUpdater();
    
    // Configuration for cost monitoring
    this.config = {
      costPerToken: 0.015 / 1000, // Claude Opus pricing
      defaultCostLimit: 0.10,
      smartModeThreshold: {
        aiScore: 3.0,        // Use smart mode if AI score > 3
        replacements: 15,    // Use smart mode if > 15 replacements
        wordCount: 500,      // Always use smart mode for < 500 words
        importance: ['high', 'critical'] // Document importance levels
      }
    };
    
    // Track usage for cost monitoring
    this.usage = {
      totalCost: 0,
      apiCalls: 0,
      tokensUsed: 0,
      startDate: new Date()
    };
    
    // Expanded AI words list - includes words from your problematic output
    this.aiWords = [
      // Words that appeared in your output that weren't caught
      'transcends', 'merely', 'occupying', 'capacity', 'objective', 
      'effectively', 'simultaneously', 'hallmark', 'pursuit', 'guiding',
      'individuals', 'future-oriented', 'encompasses', 'extends', 'enable',
      'navigate', 'possess', 'maintaining', 'achieving', 'combination',
      'qualities', 'authority', 'inspire', 'motivate',
      
      // Your existing AI words
      'demonstrate', 'utilize', 'facilitate', 'commence', 'terminate',
      'implement', 'optimize', 'enhance', 'leverage', 'subsequently',
      'therefore', 'furthermore', 'moreover', 'consequently', 'nevertheless',
      'however', 'additionally', 'specifically', 'particularly', 'essentially',
      'fundamentally', 'significantly', 'substantially', 'considerably',
      'approximately', 'establish', 'maintain', 'acquire',
      'accomplish', 'generate', 'construct', 'methodology', 'comprehensive',
      
      // Additional high-frequency AI words
      'multifaceted', 'proficiency', 'capability', 'stimulate',
      'strategizing', 'aptitude', 'institution', 'prosperity', 'delve',
      'showcase', 'foster', 'vital', 'crucial', 'essential', 'pivotal',
      'robust', 'innovative', 'strategic', 'holistic', 'stakeholder',
      'synergy', 'underscore', 'accentuate', 'illustrate', 'resilient'
    ];
  }

  async processText(text, options = {}) {
    const {
      mode = 'auto',
      aggressiveness = 'medium',
      showAnalysis = false,
      preserveTechnicalTerms = true,
      maintainTone = true,
      synonymFunction = null
    } = options;

    try {
      console.log('[HybridAIReplacer] Starting text processing...');
      console.log(`[HybridAIReplacer] Input: "${text}"`);
      
      // Use your frequency analyzer to get AI score and detected words
      const analysis = this.frequencyAnalyzer.analyzeText(text);
      console.log(`[HybridAIReplacer] AI Score: ${analysis.averageRatio.toFixed(2)}`);
      console.log(`[HybridAIReplacer] Detected AI words: [${analysis.detectedAIWords.join(', ')}]`);
      
      const replacements = [];
      let processedText = text;
      
      // Get all words from text
      const words = text.match(/\b\w+\b/g) || [];
      const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
      
      console.log(`[HybridAIReplacer] Processing ${uniqueWords.length} unique words`);
      
      for (const word of uniqueWords) {
        // Skip if word is too short
        if (word.length < 3) continue;
        
        // Skip technical terms if preservation is enabled
        if (preserveTechnicalTerms && this.isTechnicalTerm(word)) {
          console.log(`[HybridAIReplacer] Skipping technical term: ${word}`);
          continue;
        }
        
        // Check using BOTH your frequency analyzer AND manual list
        const isAIByFrequency = analysis.detectedAIWords.includes(word);
        const isAIByList = this.isAIWord(word);
        
        if (isAIByFrequency || isAIByList) {
          console.log(`[HybridAIReplacer] 🎯 FOUND AI word: "${word}" (frequency: ${isAIByFrequency}, list: ${isAIByList})`);
          
          let replacement = null;
          
          // Try your frequency analyzer's replacement first
          const freqReplacement = this.frequencyAnalyzer.findBestReplacement(word);
          if (freqReplacement && freqReplacement !== word) {
            replacement = freqReplacement;
            console.log(`[HybridAIReplacer] 📊 Frequency replacement: "${word}" → "${replacement}"`);
          }
          
          // Try synonym function if frequency analyzer didn't work
          if (!replacement && synonymFunction) {
            try {
              const synonyms = await synonymFunction(word);
              if (synonyms && synonyms.length > 0) {
                replacement = synonyms[0];
                console.log(`[HybridAIReplacer] 📡 API synonym: "${word}" → "${replacement}"`);
              }
            } catch (error) {
              console.error(`[HybridAIReplacer] API failed for "${word}":`, error);
            }
          }
          
          // Check manual fallback BEFORE trying other APIs (since manual is better quality)
          if (!replacement) {
            replacement = this.getManualFallback(word);
            if (replacement) {
              console.log(`[HybridAIReplacer] 📖 Manual fallback: "${word}" → "${replacement}"`);
            }
          }
          
          // Final fallback to improved Datamuse only if manual fallback doesn't exist
          if (!replacement) {
            try {
              const synonyms = await this.getImprovedSynonyms(word);
              if (synonyms && synonyms.length > 0) {
                replacement = synonyms[0];
                console.log(`[HybridAIReplacer] 🔄 Datamuse fallback: "${word}" → "${replacement}"`);
              }
            } catch (error) {
              console.error(`[HybridAIReplacer] Datamuse failed for "${word}":`, error);
            }
          }
          
          if (replacement && replacement !== word) {
            // Replace all instances of this word (case insensitive)
            const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, 'gi');
            processedText = processedText.replace(regex, (match) => {
              // Preserve the original case
              if (match[0] === match[0].toUpperCase()) {
                return replacement.charAt(0).toUpperCase() + replacement.slice(1);
              }
              return replacement;
            });
            
            replacements.push({
              original: word,
              replacement: replacement,
              confidence: 0.8,
              source: freqReplacement ? 'frequency-analyzer' : (synonymFunction ? 'api-synonym' : 'datamuse'),
              context: 'ai-word-simplification'
            });
            
            console.log(`[HybridAIReplacer] ✅ Replaced "${word}" with "${replacement}"`);
          } else {
            console.log(`[HybridAIReplacer] ❌ No replacement found for: "${word}"`);
          }
        }
      }

      console.log(`[HybridAIReplacer] ✅ Completed! Made ${replacements.length} replacements`);
      console.log(`[HybridAIReplacer] Final text: "${processedText}"`);

      // Log replacements to database for learning
      if (replacements.length > 0) {
        try {
          await this.dbUpdater.logReplacements(replacements, 'hybrid-ai-replacer');
          console.log(`[HybridAIReplacer] 💾 Logged ${replacements.length} replacements to database`);
        } catch (dbError) {
          console.error('[HybridAIReplacer] Failed to log to database:', dbError);
          // Continue even if database logging fails
        }
      }

      // Calculate new AI score
      const newAnalysis = this.frequencyAnalyzer.analyzeText(processedText);
      console.log(`[HybridAIReplacer] New AI Score: ${newAnalysis.averageRatio.toFixed(2)} (was ${analysis.averageRatio.toFixed(2)})`);

      return {
        text: processedText,
        replacements: replacements,
        analysis: showAnalysis ? { 
          totalReplacements: replacements.length,
          wordsProcessed: uniqueWords.length,
          aiWordsFound: replacements.map(r => r.original),
          originalAIScore: analysis.averageRatio,
          newAIScore: newAnalysis.averageRatio,
          improvement: analysis.averageRatio - newAnalysis.averageRatio
        } : null
      };

    } catch (error) {
      console.error('[HybridAIReplacer] Error:', error);
      return {
        text: text,
        replacements: [],
        analysis: { error: error.message }
      };
    }
  }

  // Manual fallback synonyms when APIs fail
  getManualFallback(word) {
    const manualMap = {
      'encompasses': 'includes',
      'extends': 'goes',
      'authority': 'power',
      'inspire': 'motivate',
      'motivate': 'encourage',
      'achieving': 'reaching',
      'maintaining': 'keeping',
      'possess': 'have',  // Changed from 'have' to more natural
      'combination': 'mix',
      'qualities': 'traits',
      'enable': 'allow',
      'navigate': 'handle',
      'demonstrate': 'show',
      'utilize': 'use',
      'facilitate': 'help',
      'enhance': 'improve',
      'leverage': 'use',
      'implement': 'put in place',
      'optimize': 'improve',
      'establish': 'set up',
      'maintain': 'keep',
      'acquire': 'get',
      'accomplish': 'achieve',
      'generate': 'create',
      'construct': 'build',
      'comprehensive': 'complete',
      'methodology': 'method',
      'subsequently': 'then',
      'therefore': 'so',
      'furthermore': 'also',
      'moreover': 'also',
      'consequently': 'as a result',
      'nevertheless': 'however',
      'additionally': 'also',
      'specifically': 'especially',
      'particularly': 'especially',
      'essentially': 'basically',
      'fundamentally': 'basically',
      'significantly': 'greatly',
      'substantially': 'greatly',
      'considerably': 'greatly',
      'approximately': 'about'
    };
    
    return manualMap[word.toLowerCase()] || null;
  }

  // Add method to save Claude's analysis to database
  async saveAnalysisToDatabase(analysis) {
    if (analysis?.wordsAnalyzed) {
      for (const wordData of analysis.wordsAnalyzed) {
        await this.dbUpdater.updateWordProbability(
          wordData.original,
          wordData.ai_prob,
          wordData.context
        );
      }
      // Force save
      await this.dbUpdater.saveToFile();
    }
  }

  // Usage reporting methods
  getUsageReport() {
    const daysUsed = (Date.now() - this.usage.startDate) / (1000 * 60 * 60 * 24);
    
    return {
      totalCost: `${this.usage.totalCost.toFixed(2)}`,
      apiCalls: this.usage.apiCalls,
      tokensUsed: this.usage.tokensUsed,
      averageCostPerCall: `${(this.usage.totalCost / (this.usage.apiCalls || 1)).toFixed(3)}`,
      dailyAverage: `${(this.usage.totalCost / (daysUsed || 1)).toFixed(2)}`,
      daysActive: Math.floor(daysUsed)
    };
  }

  resetUsageStats() {
    this.usage = {
      totalCost: 0,
      apiCalls: 0,
      tokensUsed: 0,
      startDate: new Date()
    };
  }

  // Check if word is in manual AI list (backup to frequency analyzer)
  isAIWord(word) {
    return this.aiWords.includes(word.toLowerCase());
  }

  // Check if word is a technical term that should be preserved
  isTechnicalTerm(word) {
    const technicalTerms = [
      'algorithm', 'parameter', 'variable', 'function', 'database',
      'api', 'json', 'html', 'css', 'javascript', 'python', 'sql',
      'framework', 'library', 'repository', 'deployment', 'server',
      'client', 'backend', 'frontend', 'authentication', 'encryption',
      'blockchain', 'cryptocurrency', 'machine learning', 'neural network',
      'artificial intelligence', 'deep learning', 'regression', 'classification'
    ];
    return technicalTerms.includes(word.toLowerCase());
  }

  // Escape special regex characters
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Improved synonym fetching (fallback method)
  async getImprovedSynonyms(word) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      // FIX: Use correct API path for your file structure
      const response = await fetch(`${baseUrl}/api/rewrite/get-synonyms?word=${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.synonyms && data.synonyms.length > 0) {
        console.log(`[HybridAIReplacer] Found ${data.synonyms.length} synonyms for "${word}" via ${data.source}`);
        return data.synonyms;
      }
      
      return [];
      
    } catch (error) {
      console.error(`[HybridAIReplacer] Error fetching synonyms for "${word}":`, error);
      return [];
    }
  }
}