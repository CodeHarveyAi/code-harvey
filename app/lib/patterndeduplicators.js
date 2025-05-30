// deduplicates overly repeated academic transitions and sentence openers

const transitions = [
    'in conclusion',
    'furthermore',
    'however',
    'in contrast',
    'additionally',
    'moreover',
    'nevertheless',
    'therefore',
    'as a result'
  ];
  
  const openers = [
    'it is clear that',
    'one could argue that',
    'this suggests that',
    'this shows that',
    'it is important that',
    'it should be noted that',
    'this indicates that',
    'there is no doubt that'
  ];
  
  /**
   * Deduplicates transitions that appear more than once in a text.
   */
  export function deduplicateTransitions(text) {
    if (!text || typeof text !== 'string') return text;
  
    const lines = text.split(/(?<=[.?!])\s+/);
    const used = new Set();
  
    return lines.map(line => {
      for (const t of transitions) {
        const regex = new RegExp(`\\b${t}\\b`, 'gi');
        if (regex.test(line)) {
          if (used.has(t)) {
            line = line.replace(regex, '');
          } else {
            used.add(t);
          }
        }
      }
      return line.trim();
    }).join(' ');
  }
  
  /**
   * Removes duplicated sentence openers (e.g., "It is clear that") within a single text body.
   */
  export function deduplicateOpeners(text) {
    if (!text || typeof text !== 'string') return text;
  
    const sentences = text.split(/(?<=[.?!])\s+/);
    const seen = new Set();
  
    return sentences.map(sentence => {
      const lowered = sentence.toLowerCase();
      for (const opener of openers) {
        if (lowered.startsWith(opener)) {
          if (seen.has(opener)) {
            sentence = sentence.replace(new RegExp(`^${opener}`, 'i'), '').trimStart();
          } else {
            seen.add(opener);
          }
        }
      }
      return sentence;
    }).join(' ');
  }
  