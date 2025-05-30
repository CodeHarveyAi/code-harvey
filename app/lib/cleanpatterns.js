import { deduplicateHedges } from '@/lib/deduplicatehedges.js';
import { deduplicateLexicon } from '@/lib/deduplicatelexicon.js';
import { deduplicateTransitions, deduplicateOpeners } from '@/lib/patterndeduplicators.js';
import { breakCompoundConclusions } from '@/lib/structuretools.js';

export function cleanPatterns(text) {
  let out = text;
  out = deduplicateHedges(out);
  out = deduplicateLexicon(out);
  out = deduplicateTransitions(out);
  out = deduplicateOpeners(out);
  out = breakCompoundConclusions(out);
  out = breakBannedStructures(out); // Safe breaker now

  // FIX: Remove double "and" artifacts
  out = out.replace(/\band\s+and\b/gi, 'and');

  if ((out.match(/\b(arguably|perhaps|clearly|it is important|in some ways)\b/gi) || []).length > 2) {
    out = out.replace(/\b(arguably|perhaps)\b/gi, '');
  }

  return out.trim().replace(/\s+/g, ' ');
}
export function breakBannedStructures(text) {
  let output = text;

  // 1. Disrupt reason clauses — split, but don't add transitions
  output = output.replace(/\b(because|since|as a result of|due to)\b/gi, match => {
    return `. ${match[0].toUpperCase()}${match.slice(1)}`;
  });

  // 2. Avoid cause-effect-justification patterns without inserting 'However' or 'Even so'
  output = output.replace(/([^.]+?\.)\s([^.]+?\.)\s([^.]+?\.)/g, (match, a, b, c) => {
    return `${a} ${b} ${c}`; // Just leave them as is to avoid mirroring, no need to transition
  });

  // 3. Break lists of three
  output = output.replace(
    /\b([\w\s]+?), ([\w\s]+?), (and|or) ([\w\s]+?)\b/g,
    (match, a, b, conj, c) => `${a} and ${b}. ${conj[0].toUpperCase() + conj.slice(1)} ${c}`
  );

  // 4. Reframe abstract modal traps (To + Verb)
  output = output.replace(
    /\bTo (\w+)(?:\s\w+)*, (companies|organizations|businesses) (must|should|need to)\b/gi,
    (match, action, subject, modal) =>
      `${subject[0].toUpperCase() + subject.slice(1)} often attempt to ${action}`
  );

  // 5. Conjunction stack → break with period, not transitions
  output = output.replace(
    /\bAlthough\b[^.]+?\band\b[^.]+?\b(because|since|so)\b[^.]+?\./gi,
    (match) =>
      match
        .replace(/\band\b/gi, '. Also,')
        .replace(/\b(because|since|so)\b/gi, 'That\'s partly why')
  );

  // 6. Strip known AI transitions
  output = output.replace(/\b(Furthermore|Moreover|Ultimately|Therefore|In conclusion),?/gi, '');

  // 7. Split SVO x3 without inserting transitions
  output = output.replace(
    /((?:[A-Z][a-z]+)\s(?:[a-z]+)\s(?:[a-z]+)\.)\s((?:[A-Z][a-z]+)\s(?:[a-z]+)\s(?:[a-z]+)\.)\s((?:[A-Z][a-z]+)\s(?:[a-z]+)\s(?:[a-z]+)\.)/g,
    (_, s1, s2, s3) => `${s1} ${s2} ${s3}` // No 'Then' or 'Next'
  );

  return output;
}
