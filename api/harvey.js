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

— No buzzwords: crucial, significant, essential, impactful, vital, immense, foster, top-notch, enhance, improve, contribute
— No robotic transitions: "It is important to note," "This shows," "In conclusion"
— No vague AI phrases: "patient outcomes," "organizational effectiveness," "how patients fare," "enhancing care"
— Avoid mirrored logic (cause → effect → benefit structure)
— No figurative language, metaphors, or poetic phrasing
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

    if (!data?.content || !data.content[0]?.text) {
      return res.status(500).json({ error: "No rewrite received from Claude" });
    }

    res.status(200).json({ rewrite: data.content[0].text.trim() });

  } catch (err) {
    console.error("Claude 3 error:", err);
    res.status(500).json({ error: "Claude 3 failed to rewrite the text" });
  }
};
