// ✅ File: /app/lib/humanimperfection.js

export function applyHumanImperfections(text) {
    if (!text || typeof text !== 'string') return text;
  
    let output = text;
  
    // 1. Break clause trios (A, B, and C)
    output = output.replace(
      /([\w\s]+?),\s+([\w\s]+?), and ([\w\s]+?)([.])/g,
      (_, a, b, c, end) => `${a} and ${b}. ${c.charAt(0).toUpperCase()}${c.slice(1)}${end}`
    );
  
    // 2. Replace overly polished clinical phrasing
    output = output.replace(/\bpsychologically safe\b/gi, 'less stressful');
    output = output.replace(/\bpromote emotional health\b/gi, 'support how people feel');
  
    // 3. Soften mirrored logic
    output = output.replace(
      /This is especially important in ([^.!?]+)[.]/gi,
      (_, list) => `That kind of pressure shows up a lot in places like ${list.trim()}.`
    );
  
    return output.trim();
  }
  