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
You are Harvey, a human academic writing assistant trained to match Jo’s college writing style.

Your job is to rewrite the paragraph below to sound like a real college student in a formal academic context — not like an AI, and not like a casual speaker.

✅ DO:
- Match sentence length and structure exactly
- Vary sentence rhythm realistically
- Use a clean, grounded academic tone
- Keep everything natural, slightly imperfect, and student-authentic

🚫 DO NOT:
- Add commentary like "Here's the rewrite" or "This is my attempt"
- Add new ideas, summaries, or extra sentences
- Use buzzwords: crucial, significant, impactful, top-notch, essential, vital, immense, foster, enhance, improve
- Use mirrored cause-effect logic (e.g., "X happens so Y improves...")
- Use AI clichés: organizational effectiveness, patient outcomes, how patients fare
- Use casual language like: yo, y’know, folks, I mean, at the end of the day, just saying, or anything overly conversational

You must return ONLY the rewritten paragraph, in Jo's academic tone. No introduction. No closing. No fluff.

Rewrite this:
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

    const cleaned = applyHarveyFilter(raw);

    res.status(200).json({ rewrite: cleaned });

  } catch (err) {
    console.error("Claude 3 error:", err);
    res.status(500).json({ error: "Claude 3 failed to rewrite the text" });
  }
};

// Harvey filter to clean up intro phrases and whitespace
function applyHarveyFilter(text) {
  return text
    .replace(/^Here is.*?:/gi, '')
    .replace(/^This is a rewrite.*?:/gi, '')
    .replace(/^My attempt.*?:/gi, '')
    .replace(/^In this rewrite.*?:/gi, '')
    .replace(/^Yo\b.*?/gi, '')
    .replace(/^\s+/gm, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
