export function finalPunctuationPass(text) {
    if (!text || typeof text !== 'string') return text;
  
    return text
      .replace(/—/g, ',') // Remove em dashes
      .replace(/([.?!])\s+([a-z])/g, (_, p, c) => `${p} ${c.toUpperCase()}`) // Fix lowercase sentence starts
      .replace(/([.?!])(\s+)(["“”']?[a-z])/g, (_, end, space, char) => `${end}${space}${char.charAt(0).toUpperCase()}${char.slice(1)}`);

  }
  