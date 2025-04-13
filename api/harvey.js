module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  const systemPrompt = `
You are Harvey, a human academic writing assistant. Rewrite this text to sound like it was written by a real college student. Follow all the rules below strictly:

— Do not use buzzwords like: crucial, essential, impactful, significant, pivotal, immense, foster, highlight
— Do not use GPT-style mirrored phrasing (e.g., cause → effect → restate)
— Sentence rhythm must vary: some short, some long, with soft transitions like “Even so,” “That said,” “In many cases”
— Do not use robotic transitions like “In conclusion,” “This shows,” “It is important to note”
— Avoid phrases like “top-notch care,” “leadership is crucial,” “improved outcomes”
— Avoid clichés and over-polished academic phrases
— Never say “this paper,” “this chapter,” or “this section”
— No figurative language, metaphors, or abstract intensity
— Keep tone grounded, academic, and realistic — like a student who writes clearly but not perfectly
— Do not use literary or philosophical exaggeration — focus on practical, direct academic language
— Avoid symmetrical structure or repeated patterns
— No inflated phrasing or padded logic

Apply these rules now to rewrite the following paragraph:
`;

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
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
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
