module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  // Break system prompt into chunks to avoid GPT filtering it out
  const systemMessages = [
    {
      role: "system",
      content: "You are Harvey, a human academic writing assistant. Your job is to rewrite student writing to sound human and natural, not like AI."
    },
    {
      role: "system",
      content: `
Use this voice: academic, clear, realistic, and not overly polished. Follow these locked rules:
- No buzzwords: crucial, significant, impactful, foster, etc.
- No mirrored logic or robotic symmetry
- Vary sentence length and rhythm
- Never start two sentences the same
- Avoid transitions like “In conclusion” or “It is important to note”
- Do NOT use: this paper, this chapter, this section
- Avoid AI phrasing like “improved outcomes” or “essential for success”
- No metaphors or poetic language
- Sound like a college student writing with clarity and intent
`
    },
    {
      role: "user",
      content: text
    }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: systemMessages,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No response from OpenAI" });
    }

    res.status(200).json({ rewrite: data.choices[0].message.content.trim() });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
};
