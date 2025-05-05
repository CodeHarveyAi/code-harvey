// ✅ File: /app/lib/grammarfix.js
// Role: Combined grammar fixes (light cleanup, soft fixes, and grammar flagging)

import { spawn } from 'child_process';

// -----------------------------------------------------------------------------
// Part 1: Light Grammar Cleanup (formerly grammarcheck.js)
// -----------------------------------------------------------------------------

export function runGrammarCleanup(text) {
  let output = text;

  output = output.replace(/\s+/g, ' ');
  output = output.replace(/\s?([.,\/#!$%\^&\*;:{}=\-_`~()])/g, '$1 ');
  output = output.replace(/([.,\/#!$%\^&\*;:{}=\-_`~()])\s?/g, ' $1');
  output = output.replace(/\b(\w+)\s+\1\b/g, '$1');
  output = output.replace(/\.\s*\./g, '.');
  output = output.replace(/\ba ([aeiou])/gi, 'an $1');
  output = output.replace(/\. ([a-z])/g, (_match, p1) => `. ${p1.toUpperCase()}`);
  output = output.replace(/The thought behind this is,\s*This/gi, 'The thought behind this is that this');
  output = output.replace(/,\s*([A-Z])/g, (_match, p1) => `, ${p1.toLowerCase()}`);
  output = output.replace(/\bemphasizeing\b/gi, 'emphasizing');

  // Patch accidental sentence splits caused by broken period insertions
  output = output
    // 1. If a period is followed by a lowercase starter, it was likely an accidental split → merge with comma
    .replace(/\. (and|but|or|as|so|because|if|although|when|while|however|then|yet|still|where|after|before)\b/gi, ', $1')
    // 2. If a period is followed immediately by a lowercase letter, treat it like a comma instead
    .replace(/\. ([a-z])/g, ', $1')
    // 3. Extra precaution: fix misplaced commas followed by periods
    .replace(/, \. /g, ', ')
    // 4. Remove space after a period if it's immediately followed by a period (rare double split)
    .replace(/\. \./g, '.');

  // Optional: small cleanup of multiple spaces created by patch
  output = output.replace(/\s{2,}/g, ' ');

  return output.trim();
}

// -----------------------------------------------------------------------------
// Part 2: Soft Grammar Fixes (formerly softgrammarfix.js)
// -----------------------------------------------------------------------------

export function softGrammarFix(text) {
  if (!text || typeof text !== 'string') return text;

  let output = text;

  // Fix stuck words like "grapplewith" ➔ "grapple with"
  output = output.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Fix missing space after periods (e.g., "systems.Nurturing" ➔ "systems. Nurturing")
  output = output.replace(/\.([A-Z])/g, '. $1');

  // Minor comma missing before conjunctions
  output = output.replace(/([^,.\s]) (and|but|or|so|yet) /gi, '$1, $2 ');

  // Normalize repeated spaces
  output = output.replace(/\s{2,}/g, ' ');

  return output.trim();
}
// -----------------------------------------------------------------------------
// Part 3: Grammar Flagging (formerly grammar.js)
// -----------------------------------------------------------------------------

export async function runGrammarFlags(text) {
  return new Promise((resolve, reject) => {
    const python = spawn('.venv\\Scripts\\python.exe', ['grammar/parse_flags.py']);
    let output = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('[spaCy Error]', data.toString());
    });

    python.on('close', () => {
      try {
        const flags = JSON.parse(output);
        resolve(flags);
      } catch (err) {
        console.error('[spaCy JSON Parse Error]', output); // Log full output for debugging
        reject('Failed to parse grammar flag output');
      }
    });

    python.stdin.write(text);
    python.stdin.end();
  });
}