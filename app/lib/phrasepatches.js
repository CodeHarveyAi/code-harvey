// ✅ File: /app/lib/phrasepatches.js
// Role: Restore broken noun phrase pairings after disruption or token cleanup

export function runPhrasePatches(text) {
  if (!text || typeof text !== 'string') return String(text);

  const pairFixes = {
    'clinical expertise, administrative skills': 'clinical expertise and administrative skills',
    'technical knowledge, interpersonal ability': 'technical knowledge and interpersonal ability',
    'rules, expectations': 'rules and expectations',
    'governance, accountability': 'governance and accountability',
    'health outcomes, patient satisfaction': 'health outcomes and patient satisfaction',
    'clear communication, active listening': 'clear communication and active listening',
    'empathy, resilience': 'empathy and resilience'
  };

  let output = text;

  for (const [broken, fixed] of Object.entries(pairFixes)) {
    const regex = new RegExp(`\\b${broken}\\b`, 'gi');
    output = output.replace(regex, fixed);
  }

  return output;
}