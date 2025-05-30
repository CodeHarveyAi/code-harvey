// File: app/lib/claudeAIAnalyzer.js

export class ClaudeAIAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.cache = new Map(); // Cache to reduce API calls
  }

  // Analyze text and get AI probability scores
  async analyzeText(text) {
    // Check cache first
    const cacheKey = this.hashText(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `Analyze this text for AI-generated patterns and suggest context-aware replacements.

Text: "${text}"

For each AI-sounding word/phrase:
1. Identify the word/phrase
2. Provide its AI probability (0.0-1.0)
3. Suggest 2-3 context-appropriate replacements that maintain the exact meaning
4. Include the part of speech and semantic role

Return JSON in this format:
{
  "analysis": [
    {
      "original": "delve",
      "ai_prob": 0.92,
      "context": "Let's delve into the details",
      "part_of_speech": "verb",
      "semantic_role": "explore/investigate",
      "replacements": [
        {"text": "look into", "fitness": 0.95},
        {"text": "explore", "fitness": 0.90},
        {"text": "examine", "fitness": 0.85}
      ]
    }
  ],
  "full_text_suggestions": [
    {
      "original": "Let's delve into the comprehensive analysis",
      "replacement": "Let's look into the detailed analysis",
      "confidence": 0.90
    }
  ]
}`
        }]
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.content[0].text);
    
    // Cache the result
    this.cache.set(cacheKey, result);
    
    return result;
  }

  hashText(text) {
    // Simple hash for caching
    return text.substring(0, 100).replace(/\s+/g, '');
  }
}

// File: app/lib/contextAwareReplacer.js

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

