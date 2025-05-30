export function detectRuleOfThree(text) {
  const matches = [];
  const triplePattern = /\b(\w+), (\w+), and (\w+)\b/gi;
  let match;
  while ((match = triplePattern.exec(text)) !== null) {
    matches.push([match[1], match[2], match[3]]);
  }
  return matches;
}
