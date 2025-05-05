// ✅ File: /app/lib/figurativefilter.js
// Role: Replace metaphorical or figurative language
// Used in: Phase 0–3, normalizeTone

function toSafeString(input) {
  if (typeof input === 'string') return input;
  if (input && typeof input === 'object') {
    if (typeof input.content === 'string') return input.content;
    try {
      return JSON.stringify(input);
    } catch {
      return '';
    }
  }
  return '';
}

const figurativeReplacements = {
  'lower the heat': 'reduce tension',
  'cool down': 'defuse',
  'boil over': 'intensify',
  'light a fire under': 'motivate quickly',
  'add fuel to the fire': 'worsen the conflict',
  'paint a picture': 'explain',
  'shed light on': 'clarify',
  'spark change': 'initiate change',
  'tug of war': 'conflict',
  'smooth sailing': 'easy process',
  'storm of criticism': 'wave of criticism',
  'touch base': 'follow up',
  'tightrope walk': 'delicate task',
  'tip of the iceberg': 'beginning of the problem',
  'ignite conversation': 'start discussion',
  'cool down the heat': 'reduce tension',
  'cool things down': 'minimize disputes',
  'calm things down': 'settle disagreements',
  'paves the way': 'leads to',
  'cool down heated situations': 'de-escalate conflict'
};

export function runFigurativeScan(text) {
  const str = toSafeString(text);
  let output = str;
  for (const [figurative, replacement] of Object.entries(figurativeReplacements)) {
    const regex = new RegExp(`\\b${figurative}\\b`, 'gi');
    output = output.replace(regex, replacement);
  }
  return output;
}

export const removeFigurativeLanguage = runFigurativeScan;
