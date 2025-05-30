export function deduplicateLexicon(text) {
  if (!text || typeof text !== 'string') return text;

  const words = text.split(/\s+/);
  const dedupedWords = [];

  for (let i = 0; i < words.length; i++) {
    const current = words[i].toLowerCase().replace(/[^a-z]/gi, '');
    const prev = words[i - 1]?.toLowerCase().replace(/[^a-z]/gi, '');
    const next = words[i + 1]?.toLowerCase().replace(/[^a-z]/gi, '');

    if (current && current === prev) continue;
    if (current && current === next) continue;

    dedupedWords.push(words[i]);
  }

  return dedupedWords.join(' ').replace(/\s+/g, ' ').trim();
}
