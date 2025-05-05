export function fixCommaSplicesAndClosers(text) {
  if (!text || typeof text !== 'string') return text;

  // Fix comma splices: split clauses joined by a comma without a coordinating conjunction
  let output = text.replace(/([^,\.?!]{30,}?),\s+(?=[A-Z])/g, (match, p1) => {
    // Skip if sentence starts with a valid transition or coordinating conjunction
    const tail = match.trim();
    if (/^(And|But|Or|So|Yet|Still|Even so|Then again|However|Nonetheless)/.test(tail)) return match;
    if (/\b(when|although|because|since|while|whereas|if|unless|before|after)\b/i.test(p1)) return match;
    return `${p1}. `; // replace comma with period
  });

  // Fix endings like ". And, But, So," etc. — clean up trailing fragments
  output = output.replace(/([a-z]{3,}),?\s+(And|But|So|Yet),?\s*\./gi, '$1.');

  return output;
}