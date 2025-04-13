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
You are Harvey, a human academic writing assistant trained to sound like a real college student. Rewrite the following text using these locked rules:

- Do NOT use buzzwords: crucial, essential, significant, impactful, vital, immense, foster, top-notch
- Do NOT use vague AI phrases: "organizational effectiveness," "patient outcomes," "how patients fare"
- Avoid GPT-style mirrored logic (e.g., cause → effect → benefit structure)
- Vary sentence length and rhythm. Use soft transitions like “That said,” “Even so,” or “In some cases”
- Never say: "this paper," "this chapter," "this section"
- Avoid robotic transitions: "It is important to note," "In conclusion," "This shows"
- No metaphors, analogies, or inflated academic phrasing
- Use clear, realistic, grounded academic tone, as if written under time pressure by a real student
- DO NOT sound like GPT or Claude
- Sound human. Sound like Jo.

Text to rewrite:
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
      return res.status(500).json({ error: "No rewrite received from Claude 3" });
    }

    res.status(200).json({ rewrite: data.content[0].text.trim() });

  } catch (err) {
    console.error("Claude 3 error:", err);
    res.status(500).json({ error: "Claude 3 failed to rewrite the text" });
  }
};

