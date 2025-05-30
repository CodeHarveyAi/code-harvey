export class ContextAwareReplacer {
  constructor(claudeAnalyzer) {
    this.analyzer = claudeAnalyzer;
    
    // Fallback replacements if Claude doesn't suggest any
    this.fallbackReplacements = {
      'delve': ['explore', 'look into', 'examine'],
      'crucial': ['important', 'key', 'vital'],
      'comprehensive': ['complete', 'thorough', 'detailed'],
      'enhance': ['improve', 'strengthen', 'boost'],
      'leverage': ['use', 'utilize', 'employ'],
      'foster': ['encourage', 'promote', 'support'],
      'facilitate': ['help', 'enable', 'assist']
    };
  }

  async replaceAIWords(text, aggressiveness = 'medium') {
    // Get Claude's analysis
    const analysis = await this.analyzer.analyzeText(text);
    
    // Determine threshold based on aggressiveness
    const threshold = {
      'low': 0.8,      // Only replace very AI-like words (>80%)
      'medium': 0.6,   // Replace moderately AI-like words (>60%)
      'high': 0.4      // Replace anything remotely AI-like (>40%)
    }[aggressiveness];

    let result = text;
    const replacements = [];

    // Sort by position (reverse) to maintain indices while replacing
    const sortedAnalysis = analysis.analysis
      .filter(item => item.ai_prob >= threshold)
      .sort((a, b) => b.position - a.position);

    // Apply replacements
    for (const item of sortedAnalysis) {
      const replacement = this.selectBestReplacement(item, aggressiveness);
      
      if (replacement) {
        // Use regex to maintain capitalization
        const regex = new RegExp(`\\b${item.original}\\b`, 'gi');
        result = result.replace(regex, (match) => {
          // Preserve capitalization
          if (match[0] === match[0].toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }
          return replacement;
        });

        replacements.push({
          original: item.original,
          replacement: replacement,
          context: item.context,
          ai_prob: item.ai_prob
        });
      }
    }

    // Apply full-text suggestions for better flow
    if (analysis.full_text_suggestions) {
      for (const suggestion of analysis.full_text_suggestions) {
        if (suggestion.confidence >= threshold) {
          result = result.replace(suggestion.original, suggestion.replacement);
        }
      }
    }

    return {
      text: result,
      replacements,
      originalAIScore: this.calculateAIScore(text, analysis),
      newAIScore: this.calculateAIScore(result, analysis)
    };
  }

  selectBestReplacement(item, aggressiveness) {
    // Use Claude's context-aware suggestions
    if (item.replacements && item.replacements.length > 0) {
      // Sort by fitness score
      const sorted = item.replacements.sort((a, b) => b.fitness - a.fitness);
      
      if (aggressiveness === 'high') {
        // Pick the most different option
        return sorted[sorted.length - 1].text;
      } else {
        // Pick the best fitting option
        return sorted[0].text;
      }
    }
    
    // Fallback to predefined replacements
    const fallbacks = this.fallbackReplacements[item.original.toLowerCase()];
    if (fallbacks) {
      return fallbacks[0];
    }
    
    return null;
  }

  calculateAIScore(text, analysis) {
    const words = text.toLowerCase().split(/\s+/).length;
    const aiWords = analysis.analysis.filter(item => item.ai_prob >= 0.6).length;
    return (aiWords / words) * 100;
  }
}