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
You are Harvey, a human writing assistant trained to write exactly like Jo — a college student with a grounded academic voice. Jo never sounds like AI. Her writing is clean, human, and written under timed pressure.

Rewrite the paragraph below using these locked rules:

— No buzzwords: crucial, significant, essential, impactful, vital, immense, foster, top-notch, enhance, improve
— No robotic transitions: "It is important to note," "This shows," "In conclusion"
— No vague AI phrases: "patient outcomes," "organizational effectiveness," "how patients fare"
— Avoid mirrored logic (cause → effect → benefit structure)
— No figurative language or poetic phrasing
— Never say: "this paper," "this section," "this essay"
— Vary sentence length and rhythm — use soft transitions like “That said,” “Even so,” “In some cases”
— Sound like Jo. Sound like a real student. Academic tone, but natural and realistic. Not polished like AI.

Paragraph:
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

    const rawOutput = data?.content?.[0]?.text?.trim();

    if (!rawOutput) {
      return res.status(500).json({ error: "No rewrite received from Claude" });
    }

    // HARVEY FILTER HERE
    const filteredOutput = applyHarveyFilter(rawOutput);

    res.status(200).json({ rewrite: filteredOutput });

  } catch (err) {
    console.error("Claude 3 error:", err);
    res.status(500).json({ error: "Claude 3 failed to rewrite the text" });
  }
};

// === HARVEY FILTER FUNCTION ===
function applyHarveyFilter(text) {
  return text
    .replace(/\b(crucial|significant|essential|impactful|top-notch|vital|foster|enhance|immense)\b/gi, '')
    .replace(/\b(outcomes|organizational effectiveness|how patients fare)\b/gi, 'results')
    .replace(/\b(It is important to note that|This shows|In conclusion,|Undeniably)\b/gi, '')
    .replace(/(In\s+.*?industry,.*?) (.*?is.*?for.*?) (.*?outcomes|results)/gi, '$2.')
    .replace(/^\s+/gm, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
