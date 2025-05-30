// File: app/lib/analysisDashboard.js

export class AIAnalysisDashboard {
  constructor() {
    this.analysisHistory = [];
    this.wordDatabase = new Map();
  }

  recordAnalysis(text, claudeAnalysis, replacements) {
    const analysis = {
      timestamp: new Date(),
      text: text.substring(0, 100) + '...',
      claudeAnalysis,
      replacements,
      wordsAnalyzed: claudeAnalysis.analysis || []
    };

    this.analysisHistory.push(analysis);

    // Update word database with Claude's findings
    claudeAnalysis.analysis?.forEach(item => {
      const existing = this.wordDatabase.get(item.original) || {
        occurrences: 0,
        avgAIProb: 0,
        contexts: []
      };

      existing.occurrences++;
      existing.avgAIProb = 
        (existing.avgAIProb * (existing.occurrences - 1) + item.ai_prob) / 
        existing.occurrences;
      existing.contexts.push(item.context);

      this.wordDatabase.set(item.original, existing);
    });

    return analysis;
  }

  getWordReport() {
    return Array.from(this.wordDatabase.entries())
      .sort((a, b) => b[1].avgAIProb - a[1].avgAIProb)
      .map(([word, data]) => ({
        word,
        ...data
      }));
  }

  getMissedWords(text) {
    // Find AI words that weren't replaced
    const aiWords = ['foster', 'enhance', 'crucial', 'delve', 'comprehensive'];
    const missed = [];

    aiWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (text.match(regex)) {
        missed.push(word);
      }
    });

    return missed;
  }
}
