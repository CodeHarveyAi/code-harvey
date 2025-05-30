export function deduplicateHedges(text) {
    if (!text || typeof text !== 'string') return text;
  
    // Step 1: Normalize hedge list
    const hedges = [
      'arguably',
      'perhaps',
      'to be fair',
      'in reality',
      'in some ways',
      'it’s worth noting',
      'it seems',
      'in real terms',
      'in truth',
      'some might say',
      'it’s worth considering'
    ];
  
    // Step 2: Collapse adjacent hedges (e.g., "perhaps, arguably")
    const hedgePattern = new RegExp(
      `\\b(${hedges.join('|')})(,?\\s+)?(${hedges.join('|')})\\b`,
      'gi'
    );
  
    let cleaned = text.replace(hedgePattern, (_, h1, sep, h2) => h1);
  
    // Step 3: Remove any duplicate hedge that appears *twice in the same paragraph*
    const seen = new Set();
    const paragraphSplit = cleaned.split(/(?<=[.?!])\s+/);
    const result = paragraphSplit.map((sentence) => {
      for (const hedge of hedges) {
        const hedgeRegex = new RegExp(`\\b${hedge}\\b`, 'gi');
        if ((sentence.match(hedgeRegex) || []).length > 1) {
          // Replace all instances except the first
          let found = false;
          sentence = sentence.replace(hedgeRegex, (match) => {
            if (!found) {
              found = true;
              return match;
            }
            return '';
          });
        }
      }
      return sentence.trim();
    });
  
    return result.join(' ').replace(/\s+/g, ' ').trim();
  }
  