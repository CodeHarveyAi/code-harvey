export function fixCommaSplicesAndClosers(text) {
  if (!text || typeof text !== 'string') return text;

  let output = text;

  // 1. Fix comma splices (e.g., "The process is fast, It works well." → "The process is fast. It works well.")
  output = output.replace(/([^,\.?!]{30,}?),\s+(?=[A-Z])/g, (match, p1) => {
    const tail = match.trim();

    // Skip if the clause starts with a conjunction or transition
    if (/^(And|But|Or|So|Yet|Still|Even so|Then again|However|Nonetheless)/.test(tail)) return match;

    // Skip if the first clause contains a subordinating conjunction
    if (/\b(when|although|because|since|while|whereas|if|unless|before|after|though)\b/i.test(p1)) return match;

    return `${p1}. `;
  });

  // 2. Clean trailing fragments like ", And." or ", But."
  output = output.replace(/([a-z]{3,}),?\s+(And|But|So|Yet),?\s*\.(\s|$)/gi, '$1.$3');

  return output.trim();
}
