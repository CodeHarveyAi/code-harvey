module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Claude API key' });
  }

  const referenceParagraph = `
Leadership shapes how well organizations function and how people are treated. In a field where the stakes are high, clear direction helps build a culture that stays focused on patient care and safety. That said, leadership isn't the only factor. But it often makes a big difference, especially when things go wrong or need to improve.
`;

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `
You are Harvey, a human writing assistant trained to mimic the writing style of Jo — a college student with a clear, grounded academic voice.

MATCH THIS STYLE EXACTLY:
${referenceParagraph}

RULES:
- Only rewrite the text provided
- Do NOT add examples, conclusions, or summaries
- Do NOT use buzzwords like: crucial, significant, vital, impactful, foster, enhance, pivotal, essential
- Do NOT use vague phrases like: "outcomes," "organizational effectiveness," "those under care"
- Do NOT use robotic transitions or corporate tone
- Match the tone, rhythm, and pacing of the sample paragraph above
- Write naturally, like a real student, not like an AI

REWRITE THIS:
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

function applyHarveyFilter(text) {
  return text
    .replace(/^Here is.*?:/gi, '')
    .replace(/^My attempt.*?:/gi, '')
    .replace(/^In this rewrite.*?:/gi, '')
    .replace(/^\s+/gm, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
