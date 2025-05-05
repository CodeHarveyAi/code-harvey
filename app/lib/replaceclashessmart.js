// ✅ File: /app/lib/replaceclashessmart.js
// Role: Handles word-level semantic clashes

export function replaceClashes(text) {
  if (!text || typeof text !== 'string') return text;

  return text.replace(/\bclashes\b/gi, (match, offset, fullText) => {
    const window = fullText.slice(Math.max(0, offset - 20), offset + 20).toLowerCase();
    if (/stress|work|team|communication|setting|environment|conflict|disagreement/.test(window)) {
      return match[0] === match[0].toUpperCase() ? 'Conflicts' : 'conflicts';
    }
    return match[0] === match[0].toUpperCase() ? 'Disputes' : 'disputes';
  });
}
