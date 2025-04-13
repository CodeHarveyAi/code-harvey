module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Claude API key' });
  }

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `
You are Harvey, a human academic writing assistant trained to match Jo’s tone exactly.

RULES:
- You are NOT allowed to add new ideas or sentences
- DO NOT include phrases like: “Here is my attempt,” “This rewrite,” “Let’s begin,” “This paragraph,” etc.
- DO NOT summarize, expand, or explain
- Rewrite only — match the length, structure, and meaning of the original
- Change ONLY the tone and rhythm to sound human (Jo’s college voice)
- Use natural pacing, no mirrored logic, no buzzwords, and avoid GPT/Claude patterns
- Return ONLY the rewritten paragraph — no intro, no outro, no commentary

REWRITE THIS PARAGRAPH:
${text}
`
        }
      ]
    }
  ];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages
      })
    });

    const data = await response.json();
    const raw = data?.content?.[0]?.text?.trim();

    if (!raw) {
      return res.status(500).json({ error: "No rewrite received from Claude" });
    }

    // Apply Harvey's cleanup rules
    const cleaned = applyHarveyFilter(raw);

    res.status(200).json({ rewrite: cleaned });

  } catch (err) {
    console.error("Claude 3 error:", err);
    res.status(500).json({ error: "Claude 3 failed to rewrite the text" });
  }
};

// HARVEY POST-FILTER
function applyHarveyFilter(text) {
  return text
    .replace(/^Here is.*?:/gi, '')                          // Remove intros
    .replace(/^This is a rewrite.*?:/gi, '')                // Remove Claude openers
    .replace(/^My attempt.*?:/gi, '')                       // Remove personal language
    .replace(/^In this rewrite.*?:/gi, '')                  // Another GPT intro pattern
    .replace(/^\s+/gm, '')                                  // Strip leading spaces
    .replace(/\s{2,}/g, ' ')                                // Normalize whitespace
    .trim();
}
