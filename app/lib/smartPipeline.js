// File: app/lib/enhancedSmartPipeline.js
import { ClaudeAIAnalyzer } from '../Claude/claudeaianalyzer.js';
import { ContextAwareReplacer } from '../Claude/contextAwareReplacer.js';
import { AIWordFrequencyAnalyzer } from '../Claude/aifrequencyanalyzer.js';
import { AIAnalysisDashboard } from '../Claude/analysisdashboard.js';

export class EnhancedSmartPipeline {
  constructor(claudeApiKey) {
    this.analyzer = new ClaudeAIAnalyzer(claudeApiKey);
    this.replacer = new ContextAwareReplacer(this.analyzer);
    this.frequencyAnalyzer = new AIWordFrequencyAnalyzer();
    this.dashboard = new AIAnalysisDashboard();
  }

  async processText(text, options = {}) {
    const { showAnalysis = true, updateFrequencyDB = true } = options;

    console.log('\n[Pipeline] Starting analysis...');
    
    // Get Claude's analysis
    const claudeAnalysis = await this.analyzer.analyzeText(text);
    
    // Show what Claude found
    if (showAnalysis) {
      console.log('\n[Claude Analysis] Words detected:');
      claudeAnalysis.analysis?.forEach(item => {
        console.log(`  - "${item.original}" (AI prob: ${(item.ai_prob * 100).toFixed(0)}%) in context: "${item.context}"`);
        console.log(`    Suggested replacements:`, item.replacements.map(r => r.text).join(', '));
      });
    }

    // Apply replacements
    const result = await this.replacer.replaceAIWords(text, options.aggressiveness);

    // Check for missed words
    const missedWords = this.dashboard.getMissedWords(result.text);
    if (missedWords.length > 0) {
      console.log('\n[Warning] AI words still present:', missedWords);
      
      // Force replacement of missed words
      const forcedResult = this.forceMissedWordReplacement(result.text, missedWords);
      result.text = forcedResult.text;
      result.replacements.push(...forcedResult.replacements);
    }

    // Record analysis
    const analysisRecord = this.dashboard.recordAnalysis(text, claudeAnalysis, result.replacements);

    // Update frequency analyzer with new data
    if (updateFrequencyDB) {
      claudeAnalysis.analysis?.forEach(item => {
        this.frequencyAnalyzer.updateFrequencies(
          item.original, 
          item.context, 
          true // Mark as AI
        );
      });
    }

    // Show final report
    if (showAnalysis) {
      console.log('\n[Final Report]');
      console.log(`Original AI Score: ${result.originalAIScore?.toFixed(1)}%`);
      console.log(`New AI Score: ${result.newAIScore?.toFixed(1)}%`);
      console.log(`Replacements made: ${result.replacements.length}`);
      console.log('\nReplacement details:');
      result.replacements.forEach(r => {
        console.log(`  "${r.original}" → "${r.replacement}"`);
      });
    }

    return {
      ...result,
      analysis: analysisRecord,
      missedWords,
      wordDatabase: this.dashboard.getWordReport()
    };
  }

  forceMissedWordReplacement(text, missedWords) {
    let result = text;
    const replacements = [];

    const forcedReplacements = {
      'foster': ['support', 'encourage', 'develop'],
      'enhance': ['improve', 'boost', 'strengthen'],
      'crucial': ['important', 'key', 'vital'],
      'delve': ['explore', 'look into', 'examine'],
      'comprehensive': ['complete', 'thorough', 'detailed']
    };

    missedWords.forEach(word => {
      const alternatives = forcedReplacements[word.toLowerCase()];
      if (alternatives) {
        const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        
        result = result.replace(regex, (match) => {
          replacements.push({
            original: match,
            replacement: replacement,
            forced: true
          });
          
          // Preserve capitalization
          return match[0] === match[0].toUpperCase() 
            ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
            : replacement;
        });
      }
    });

    return { text: result, replacements };
  }
}