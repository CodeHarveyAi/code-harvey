// ✅ File: /app/lib/structuretools.js
// Role: Combined phrase-level mirrored logic rewrites and pacing pattern disruption

// -----------------------------------------------------------------------------
// Part 1: Mirrored Phrase Removal
// -----------------------------------------------------------------------------

export function detectSymmetry(_text) {
    return false; // Placeholder for future AI pattern detection
  }
  
  export function removeMirroredPhrases(text) {
    return text
      .replace(/\bgrowth and development\b/gi, 'team progress')
      .replace(/\bcommunication and collaboration\b/gi, 'clear coordination')
      .replace(/\btrial and error\b/gi, 'testing process')
      .replace(/\bstrengths and weaknesses\b/gi, 'skills and gaps')
      .replace(/\bsafe and effective\b/gi, 'reliable in practice')
      .replace(/\bpolicies and procedures\b/gi, 'internal rules')
      .replace(/\brisks and benefits\b/gi, 'upsides and downsides')
      .replace(/\bknowledge and understanding\b/gi, 'awareness')
      .replace(/\bobjectives and goals\b/gi, 'targets')
      .replace(/\bchallenges and opportunities\b/gi, 'complications and options')
      .replace(/\bplanning and implementation\b/gi, 'putting plans into action')
      .replace(/\brespect and dignity\b/gi, 'basic courtesy');
  }
  
  // -----------------------------------------------------------------------------
  // Part 2: Pacing Pattern Disruption
  // -----------------------------------------------------------------------------
  
  export function breakPacingPatterns(text, skip = false) {
    if (skip || !text || typeof text !== 'string') {
      console.warn('[breakPacingPatterns] Skipping due to invalid input');
      return text || '';
    }
  
    let output = text;
    let inserted = 0;
    const maxInsertions = 1;
  
    const used = new Set();
    const disruptionPhrases = [
      "Even so,", "Still,", "That said,", "Yet,", "To be fair,",
      "In some cases,", "Then again,", "It depends,", "For instance,", "For this reason,"
    ];
  
    function getUniqueDisruptor() {
      const options = disruptionPhrases.filter(x => !used.has(x));
      if (options.length === 0) return '';
      const choice = options[Math.floor(Math.random() * options.length)];
      used.add(choice);
      return choice;
    }
  
    const sentences = text.split(/(?<=[.?!])\s+/);
    const varied = [];
  
    for (let sentence of sentences) {
      const safeSplit = /, (and|but|or|so) /i;
      if (sentence.length >= 100 && safeSplit.test(sentence) && inserted < maxInsertions) {
        const parts = sentence.split(safeSplit);
        if (parts.length > 1) {
          const first = parts[0].trim();
          const rest = parts.slice(1).join(', ').trim();
  
          // New check: both sides must be > 30 chars AND grammatically complete
          if (first.length > 30 && rest.length > 30 && /^[A-Z]/.test(rest)) {
            const disruptor = getUniqueDisruptor();
            if (disruptor) {
              // Clean possible leftover conjunctions ("And,", "But,") at start of second half
              const cleanedRest = rest.replace(/^(and|but|or|so),?\s+/i, '');
              varied.push(`${first}. ${disruptor} ${cleanedRest.charAt(0).toUpperCase()}${cleanedRest.slice(1)}`);
              inserted++;
              continue;
            }
          }
        }
      }
      varied.push(sentence);
    }
  
    output = varied.join(' ').replace(/\s{2,}/g, ' ');
  
    if (!output || typeof output !== 'string') {
      console.warn('[breakPacingPatterns] Returned non-string result');
      return text;
    }
  
    return output.trim();
  }