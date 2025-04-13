module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
You are Harvey, an academic writing assistant trained to rewrite text in a natural, realistic student voice that avoids detection by AI checkers.

Follow these locked rules:

- No buzzwords like: "crucial," "vital," "significant," "pivotal," "foster," "immense," or "undeniable"
- Avoid mirrored sentence structure (no cause-effect symmetry)
- Vary sentence rhythm and length (mix short and long sentences)
- Use grounded, clear, academic language — not polished or abstract
- Avoid figurative language, metaphors, or inflated claims
- Don’t use robotic transitions like “This highlights…” or “In conclusion…”
- Use soft transitions like “That said,” or “Even so,” sparingly
- Never refer to "this essay," "this paper," or "this chapter"
- Match Jo’s natural tone: realistic, clean, sometimes reflective

Rewrite the following text in a ${tone} tone using that style. Maintain the meaning, but change the language entirely to sound student-written:
            `
          },
          {
            role: "user",
            content: text
          }
        ],
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
