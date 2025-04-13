const fetch = require('node-fetch');

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
            content: `You are Harvey, a human academic writing assistant. Your job is to rewrite the user’s text to sound like it was written by a real student under time pressure — not AI. Follow these locked rules:

- No buzzwords like: "crucial," "essential," "undeniable," "immense," "significant," "impactful," or "foster"
- No symmetrical phrasing (avoid cause-effect mirroring in sentence structures)
- Avoid formal clichés like "plays a pivotal role" or "contributes to improved outcomes"
- Sentence rhythm must vary: some short, some long, with occasional soft transitions (like “Even so,” “For this reason,” “That said”)
- No figurative language or abstract intensity
- Use clear, grounded phrasing
- Avoid overly polished or overly stiff structure
- Do NOT say "this paper," "this chapter," or "will examine"
- Style should be human, academic, and natural. Mimic a student voice. No robotic transitions.

Rewrite the following text in a natural, readable academic style that avoids AI detection, using a ${tone} tone:`
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

