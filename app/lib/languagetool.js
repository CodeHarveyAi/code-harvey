export async function runLanguageToolGrammarCheck(text) {
  try {
    const res = await fetch('https://api.languagetoolplus.com/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        text,
        language: 'en-US'
      })
    });

    if (!res.ok) throw new Error(`LanguageTool response ${res.status}`);

    const data = await res.json();
    let corrected = text;

    for (const match of data.matches.reverse()) {
      const replacement = match.replacements[0]?.value;
      if (replacement) {
        corrected =
          corrected.slice(0, match.offset) +
          replacement +
          corrected.slice(match.offset + match.length);
      }
    }

    return corrected;
  } catch (err) {
    console.error('[LanguageTool] Grammar check failed:', err.message);
    return text; // fallback: return original if failed
  }
}
