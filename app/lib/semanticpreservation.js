// File: app/lib/semanticPreservingReplacer.js

export class SemanticPreservingReplacer {
  constructor() {
    // Context-aware replacement patterns
    this.contextualReplacements = {
      // Pattern: { word: { context_pattern: replacement } }
      'cultivates': {
        'collaboration|teamwork|cooperation': 'builds a culture of',
        'environment|atmosphere': 'creates an environment that nurtures',
        'trust|relationship': 'develops and strengthens',
        'default': 'develops'
      },
      'articulates': {
        'vision|goal|strategy': 'clearly communicates the',
        'plan|approach': 'lays out a clear',
        'idea|concept': 'expresses',
        'default': 'explains'
      },
      'embodies': {
        'values|principles': 'lives by and demonstrates',
        'leadership|qualities': 'shows through actions',
        'spirit|culture': 'represents',
        'default': 'shows'
      },
      'leverages': {
        'strengths|skills|expertise': 'makes the most of',
        'resources|assets': 'puts to good use',
        'technology|tools': 'uses effectively',
        'default': 'uses'
      },
      'fosters': {
        'innovation|creativity': 'encourages and supports',
        'growth|development': 'promotes continuous',
        'environment|culture': 'creates conditions for',
        'default': 'encourages'
      },
      'encompasses': {
        'skills|abilities': 'includes a full range of',
        'aspects|elements': 'covers all important',
        'responsibilities': 'involves',
        'default': 'includes'
      }
    };

    // Semantic importance scores (1-5, where 5 is most important to preserve)
    this.semanticWeights = {
      'multifaceted': 4, // Important for conveying complexity
      'cultivates': 4,   // Important for conveying development/growth
      'articulates': 3,  // Medium importance
      'strategic': 4,    // Important for business context
      'collaborative': 3,
      'innovative': 3,
      'comprehensive': 4,
      'holistic': 4
    };

    // Paired substitution templates
    this.pairedSubstitutions = {
      'effective leadership': {
        'requires': 'calls for',
        'demands': 'needs'
      },
      'shared objectives': {
        'achieve': 'work toward',
        'pursue': 'aim for'
      },
      'clear vision': {
        'articulates': 'lays out',
        'communicates': 'shares'
      },
      'diverse skills': {
        'leverages': 'draws on',
        'utilizes': 'makes use of'
      }
    };
  }

  calculateSemanticLoss(original, replacement, context) {
    // Calculate how much meaning is lost in the replacement
    const originalWeight = this.semanticWeights[original.toLowerCase()] || 3;
    
    // Simple heuristic: shorter replacements typically lose more meaning
    const lengthRatio = replacement.length / original.length;
    
    // Context preservation score (0-1)
    const contextMatch = this.assessContextPreservation(original, replacement, context);
    
    // Semantic loss score (0-1, where 0 is no loss, 1 is complete loss)
    const semanticLoss = 1 - (lengthRatio * 0.3 + contextMatch * 0.7);
    
    return {
      score: semanticLoss,
      acceptable: semanticLoss < 0.4, // Threshold for acceptable loss
      recommendation: semanticLoss > 0.4 ? 'Consider richer alternative' : 'Good replacement'
    };
  }

  assessContextPreservation(original, replacement, context) {
    // Check if the replacement maintains the contextual meaning
    const keyConceptsInContext = this.extractKeyConcepts(context);
    
    // Higher score if replacement maintains relationship with key concepts
    let score = 0.5; // baseline
    
    if (keyConceptsInContext.includes('leadership') || keyConceptsInContext.includes('leader')) {
      score += 0.2;
    }
    
    if (keyConceptsInContext.includes('team') || keyConceptsInContext.includes('collaboration')) {
      score += 0.2;
    }
    
    if (keyConceptsInContext.includes('vision') || keyConceptsInContext.includes('goal')) {
      score += 0.1;
    }
    
    return Math.min(score, 1);
  }

  extractKeyConcepts(text) {
    const concepts = [];
    const keyWords = ['leadership', 'team', 'vision', 'goal', 'strategy', 'collaboration', 
                      'innovation', 'growth', 'culture', 'environment'];
    
    keyWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        concepts.push(word);
      }
    });
    
    return concepts;
  }

  replaceWithContext(text, options = {}) {
    const { preserveKeyMeaning = true, maxSemanticLoss = 0.4 } = options;
    
    let result = text;
    const replacements = [];
    const semanticAnalysis = [];

    // Process each sentence to maintain context
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    sentences.forEach((sentence, sentIdx) => {
      let processedSentence = sentence;
      
      // Check for contextual patterns
      Object.entries(this.contextualReplacements).forEach(([word, patterns]) => {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
        
        if (wordRegex.test(processedSentence)) {
          // Find the best contextual replacement
          let bestReplacement = patterns.default;
          
          Object.entries(patterns).forEach(([contextPattern, replacement]) => {
            if (contextPattern !== 'default') {
              const contextRegex = new RegExp(contextPattern, 'i');
              if (contextRegex.test(processedSentence)) {
                bestReplacement = replacement;
              }
            }
          });
          
          // Calculate semantic loss
          const semanticLoss = this.calculateSemanticLoss(word, bestReplacement, processedSentence);
          
          if (!preserveKeyMeaning || semanticLoss.acceptable) {
            processedSentence = processedSentence.replace(wordRegex, (match) => {
              // Preserve capitalization
              const replacement = match[0] === match[0].toUpperCase() 
                ? bestReplacement.charAt(0).toUpperCase() + bestReplacement.slice(1)
                : bestReplacement;
              
              replacements.push({
                original: match,
                replacement: replacement,
                context: sentence.substring(0, 50) + '...',
                semanticLoss: semanticLoss.score
              });
              
              return replacement;
            });
          } else {
            // Keep original if semantic loss is too high
            semanticAnalysis.push({
              word: word,
              kept: true,
              reason: 'High semantic loss',
              suggestedAlternative: bestReplacement,
              semanticLoss: semanticLoss
            });
          }
        }
      });
      
      result = result.replace(sentence, processedSentence);
    });

    return {
      text: result,
      replacements,
      semanticAnalysis,
      preservedMeaningScore: this.calculateOverallMeaningPreservation(text, result)
    };
  }

  calculateOverallMeaningPreservation(original, processed) {
    // Simple metric: combination of length preservation and key concept retention
    const lengthRatio = processed.length / original.length;
    const keyConcepts = this.extractKeyConcepts(original);
    const preservedConcepts = keyConcepts.filter(concept => 
      processed.toLowerCase().includes(concept)
    );
    
    const conceptPreservation = preservedConcepts.length / (keyConcepts.length || 1);
    
    return {
      score: (lengthRatio * 0.3 + conceptPreservation * 0.7),
      lengthRatio,
      conceptsPreserved: `${preservedConcepts.length}/${keyConcepts.length}`,
      rating: conceptPreservation > 0.8 ? 'Excellent' : 
              conceptPreservation > 0.6 ? 'Good' : 
              conceptPreservation > 0.4 ? 'Fair' : 'Poor'
    };
  }

  // Enhanced replacement for your example
  enhancedReplace(text) {
    const enhancedReplacements = {
      'Leadership is a multifaceted concept': 'Leadership involves many different aspects',
      'embodies the ability': 'means being able',
      'guide and influence': 'lead and inspire',
      'shared objectives': 'common goals',
      'effective leadership requires': 'good leadership needs',
      'diverse set of skills': 'wide range of abilities',
      'strategic decision-making': 'thoughtful planning and choices',
      'capacity to inspire': 'ability to motivate',
      'articulates a clear and compelling vision': 'lays out a clear plan that inspires others',
      'cultivates an environment': 'creates a workplace',
      'collaboration and trust can flourish': 'people work well together with mutual respect',
      'supportive atmosphere': 'encouraging environment',
      'leverage their unique strengths': 'use their individual talents',
      'ultimately enhancing': 'which improves',
      'collective effort': 'team\'s work'
    };

    let result = text;
    Object.entries(enhancedReplacements).forEach(([original, replacement]) => {
      result = result.replace(new RegExp(original, 'gi'), replacement);
    });

    return result;
  }
}

// Integration with your existing pipeline
export function semanticAwareReplace(text, options = {}) {
  const replacer = new SemanticPreservingReplacer();
  return replacer.replaceWithContext(text, options);
}