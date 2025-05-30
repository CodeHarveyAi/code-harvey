// File: /app/lib/phase6_5patterncheck.js

const aiFlags = {
  roboticFormality: {
    label: 'Robotic Formality',
    patterns: [
      /\b(Furthermore|Moreover|Additionally|In addition|Subsequently)\b/gi,
      /\b(It is important to note|It should be noted|It is worth mentioning)\b/gi,
      /\b(In order to|For the purpose of|With regard to)\b/gi
    ]
  },
  
  lacksComplexity: {
    label: 'Lacks Complexity',
    patterns: [
      /^[^.!?]*\b(will|can|should|must)\b[^.!?]*[.!?]$/gm,
      /\b(The solution is|The answer is|The key is)\b/gi,
      /\b(Simply|Just|Merely|Only)\b/gi
    ]
  },

  overlyFormal: {
    label: 'Overly Formal',
    patterns: [
      /\b(In conclusion|To conclude|In summary|To summarize)\b/gi,
      /\b(It is essential|It is crucial|It is vital)\b/gi,
      /\b(One must|One should|One ought to)\b/gi,
      /\b(Utilize|Implement|Execute|Facilitate)\b/gi
    ]
  },

  functionalWordChoice: {
    label: 'Functional Word Choice',
    patterns: [
      /\b(Achieve|Accomplish|Attain|Obtain)\b/gi,
      /\b(Determine|Establish|Identify|Recognize)\b/gi,
      /\b(Enhance|Improve|Optimize|Maximize)\b/gi
    ]
  },

  formulaicTransitions: {
    label: 'Formulaic Transitions',
    patterns: [
      /\b(However|Nevertheless|Nonetheless|On the other hand)\b/gi,
      /\b(Therefore|Thus|Hence|Consequently)\b/gi,
      /\b(First|Second|Third|Finally)\b(?=,|\s)/gi
    ]
  }
};

export function detectAIStyleFlags(text) {
  const flags = [];

  Object.entries(aiFlags).forEach(([key, { label, patterns }]) => {
    patterns.forEach((regex) => {
      try {
        const matches = text.match(regex);
        if (matches) {
          matches.forEach((match) => {
            flags.push({ type: label, match });
          });
        }
      } catch (error) {
        console.error(`[detectAIStyleFlags] Error matching regex for key ${key} and label ${label}:`, error);
      }
    });
  });

  return flags;
}

export function isAISafe(text, threshold = 3) {
  try {
    const flags = detectAIStyleFlags(text);
    return {
      safe: flags.length <= threshold,
      flagged: flags
    };
  } catch (error) {
    console.error("[isAISafe] Error detecting AI style flags:", error);
    return {
      safe: false,
      flagged: []
    };
  }
} 
export function detectRuleOfThree(text) {
  const matches = [];
  const triplePattern = /\b(\w+), (\w+), and (\w+)\b/gi;
  let match;
  while ((match = triplePattern.exec(text)) !== null) {
    matches.push([match[1], match[2], match[3]]);
  }
  return matches;
}
