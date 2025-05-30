// File: app/lib/transitiondetector.js
const aiTransitionSwapMap = {
  "Additionally": "Added to that",
  "As a result": "For this reason",
  "Because": "Seeing as",
  "Clearly": "Plainly",
  "Consequently": "In which case",
  "For example": "Examples include",
  "For instance": "Case in point",
  "Furthermore": "Also",
  "However": "But",
  "In conclusion": "To end",
  "In fact": "In reality",
  "In other words": "Put simply",
  "In particular": "Notably",
  "In summary": "In closing",
  "It’s important to note that": "Keep in mind",
  "It’s worth noting that": "What stands out is",
  "Moreover": "What’s more",
  "Nevertheless": "In any event",
  "Nonetheless": "Yet",
  "On the other hand": "Then again",
  "Overall": "Ultimately",
  "Specifically": "Especially",
  "That being said": "With that said",
  "To summarize": "Simply put"
};

// Detect transitions (case-insensitive, word-boundary safe)
export function detectTransitions(text) {
  if (!text || typeof text !== 'string') return false;
  return Object.keys(aiTransitionSwapMap).some(phrase => {
    const re = new RegExp(`\\b${phrase}\\b`, 'i');
    return re.test(text);
  });
}

// Replace AI-style transitions with more human equivalents
export function replaceAITransitions(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;

  for (const [aiPhrase, humanPhrase] of Object.entries(aiTransitionSwapMap)) {
    const pattern = new RegExp(`\\b${aiPhrase}\\b`, 'gi');

    result = result.replace(pattern, match => {
      const replacement = match[0] === match[0].toUpperCase()
        ? capitalizeFirst(humanPhrase)
        : humanPhrase.toLowerCase();
      return replacement;
    });
  }

  return result;
}

// Capitalizes the first letter of a string
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
