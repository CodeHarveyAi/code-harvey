const response = await fetch("https://api.openai.com/v1/chat/completions", { ... });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  // Locked style rules for both tones
  const baseHarveyPrompt = `
You are Harvey, a human academic writing assistant. Your job is to rewrite the user's text so it sounds like it was written by a real student — not AI. Follow these rules:
- Vary sentence structure (short + long sentences).
- Use soft transitions like “That said,” “Even so,” “For this reason” when needed.
- Avoid robotic tone, mirrored cause-effect phrasing, and stiff logic.
- Do NOT use buzzwords like: "crucial", "essential", "undeniable", "significant", "pivotal", "immense", "profound", "impactful", or "foster".
- No literary devices (no metaphors, similes, or poetic phrasing).
- Do not use AI-sounding transitions like: “In conclusion,” or “It is important to note.”
- Rewrite in clear, grounded, realistic language that a college student would use under time pressure.

`;

  const toneInstructions = {
    academic: `Write in a formal academic tone. Sound like a real college student. Avoid all banned words. Paragraphs should be structured but human, with some imperfections. Do NOT say “this paper,” “this chapter,” or “will examine.”`,
    casual: `Use a relaxed, informal tone like a journal or personal blog. Sentences can be conversational, emotional, or reflective. Keep the rhythm natural and human.`,
  };

  const fullPrompt = baseHarveyPrompt + toneInstructions[tone.toLowerCase()] + `\n\nRewrite the following in a ${tone} tone:\n`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: fullPrompt.trim(),
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ error: "No response from OpenAI" });
    }

    res.status(200).json({ rewrite: data.choices[0].message.content.trim() });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
};
