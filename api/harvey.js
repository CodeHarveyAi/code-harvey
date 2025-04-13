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

- Do not use AI-sounding terms like: "crucial," "vital," "significant," "pivotal," "foster," "immense," "undeniable," or "impactful"
- Avoid symmetrical sentence structures (no mirrored logic or cause-effect reflections)
- Vary sentence rhythm with a mix of short and long sentences
- Use grounded, everyday academic language — not polished, abstract, or dramatic phrasing
- Never say "this paper," "this essay," or "this chapter"
- No metaphors or figurative language
- Avoid stiff or robotic transitions (like “In conclusion,” or “This highlights”)
- Use soft transitions instead: "Even so," "For this reason," "That said"
- Sound like a real student thinking things through under time pressure

Rewrite the following text in a ${tone} tone using Jo's writing style. Keep the original meaning, but rephrase everything with realistic student-level language:
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
