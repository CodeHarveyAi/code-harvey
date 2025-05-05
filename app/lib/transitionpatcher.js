// transitionpatcher.js

export function patchTransitions(text, options = {}) {
  if (!text || typeof text !== 'string') return text;

  const defaultOptions = {
    contrast: true,
    result: true,
    addition: true,
    clarification: true,
    sequence: true,
    summary: true,
    reason: true,
    emphasis: true
  };

  const settings = { ...defaultOptions, ...options };
  const swaps = [];

  if (settings.contrast) {
    swaps.push({
      pattern: /(\.|\;)\s*(However|Nevertheless|Nonetheless|In contrast|On the other hand),/gi,
      replacements: ['Still', 'Even so', 'Then again', 'At the same time']
    });
  }

  if (settings.result) {
    swaps.push({
      pattern: /(\.|\;)\s*(Therefore|Thus|As a result|Consequently|Hence),/gi,
      replacements: ['That’s why', 'So', 'Because of this', 'Following that']
    });
  }

  if (settings.addition) {
    swaps.push({
      pattern: /(\.|\;)\s*(Furthermore|Additionally|Moreover|Also|In addition),/gi,
      replacements: ['What’s more', 'Not only that', 'On top of that']
    });
  }

  if (settings.clarification) {
    swaps.push({
      pattern: /(\.|\;)\s*(In other words|To put it differently|That is to say),/gi,
      replacements: ['Put differently', 'What that means is', 'To say it another way']
    });
  }

  if (settings.sequence) {
    swaps.push({
      pattern: /(\.|\;)\s*(Then|Subsequently|Finally|Next|Afterward),/gi,
      replacements: ['After that', 'Eventually', 'Soon after']
    });
  }

  if (settings.summary) {
    swaps.push({
      pattern: /(\.|\;)\s*(In conclusion|To summarize|To sum up|In short|Overall),/gi,
      replacements: ['All in all', 'To wrap up', 'In closing']
    });
  }

  if (settings.reason) {
    swaps.push({
      pattern: /(\.|\;)\s*(Because|Since|Due to|As|Owing to),/gi,
      replacements: ['Given that', 'Seeing that', 'Considering']
    });
  }

  if (settings.emphasis) {
    swaps.push({
      pattern: /(\.|\;)\s*(Clearly|Indeed|Obviously|Undoubtedly|Importantly),/gi,
      replacements: ['It’s worth noting', 'What stands out is', 'Notably']
    });
  }

  // Perform replacement with protection wrapper
  swaps.forEach(({ pattern, replacements }) => {
    text = text.replace(pattern, (match, punct) => {
      const chosen = replacements[Math.floor(Math.random() * replacements.length)];
      return `${punct} [[TRANS:${chosen}]],`;
    });
  });

  return text;
}

// 🔓 Final cleanup pass to remove transition tags (called at end of Phase 7)
export function finalizeTransitions(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\[\[TRANS:(.*?)\]\]/g, '$1');
}
