// ✅ File: /app/lib/jopatternbank.js
// Purpose: Human-like sentence rhythm transformations (one pattern max per run)

export async function applyJoPattern(text, shouldApplyPattern) {
  let output = text;

  for (let i = 0; i < jopatternbank.length; i++) {
    const { pattern, transform } = jopatternbank[i];

    let patternApplied = false;

    // /app/lib/jopatternbank.js
// ...existing code...

output = output.replace(pattern, (...args) => {
  if (typeof shouldApplyPattern === 'function' && !shouldApplyPattern(i + 1)) {
    return args[0]; // skip transformation
  }

  patternApplied = true;
  console.log(`[JoPattern] Triggered Pattern ${i + 1}`);
  const transformed = transform(...args);
  console.log(`[JoPattern] Pattern ${i + 1} - Before: ${args[0]}, After: ${transformed}`); // Added log
  return transformed;
});

// ...existing code...

    if (patternApplied) break; // stop after first pattern is applied
  }

  return output;
}

export const jopatternbank = [

  // ✅ Pattern 1: Split long sentences at "and" if both parts are solid
  {
    pattern: /([^.!?]{80,150})\band\b([^.!?]{40,})/gi,
    transform: (match, p1, p2) => {
      if (!p1 || !p2) return match;
      return `${p1.trim()}. ${p2.trim().charAt(0).toUpperCase()}${p2.trim().slice(1)}`;
    }
  },

  // ✅ Pattern 2: Insert a human-style break after 2 full sentences
  {
    pattern: /((?:[^.!?]+[.!?]\s*){2})/,
    transform: (match) => {
      const burstPhrases = [
        "That means,",
        "Still,",
        "Then again,",
        "Yet,",
        "Even so,",
        "Sometimes,"
      ];
      if (/however|but|although/i.test(match)) return match;
      if (/[,\\s]*(That means|Still|Then again|Yet|Even so|Sometimes),?\\s*$/i.test(match)) return match;
      const chosen = burstPhrases[Math.floor(Math.random() * burstPhrases.length)];
      return `${match} ${chosen}`;
    }
  },

  // ✅ Pattern 3: Split after subject-following clause
  {
    pattern: /([^,]+,[^,]+),\s*(They|It|This|These|Leaders|Organizations|Hospitals)\b([^,]{10,})/g,
    transform: (_match, first, subject, rest) => {
      return `${first}. ${subject}${rest.charAt(0)}${rest.slice(1)}`;
    }
  },

  // ✅ Pattern 4: Replace semicolon with period
  {
    pattern: /;\s*/g,
    transform: () => '. '
  },

  // ✅ Pattern 5: Split "not only... but also" into 2 natural statements
  {
    pattern: /not only ([^,]+),? but also ([^.]+)\./gi,
    transform: (_, part1, part2) => {
      return `This includes ${part1.trim()}. It also includes ${part2.trim()}.`;
    }
  },

  // ✅ Pattern 6: Combine two short declarative sentences into one
  {
    pattern: /(\b[A-Z][^.!?]+\.)\s+(They|It|This|These)\b([^.!?]+\.)/g,
    transform: (_match, first, pronoun, rest) => {
      return `${first.replace(/\.$/, '')}, ${pronoun}${rest}`;
    }
  },
// /app/lib/jopatternbank.js
// ...existing code...
{
  pattern: /healthcare leaders.*pressure/i,
  transform: (match) =>
    match.replace(/pressure.*?\./i, 'difficult decisions every day.')
},

];