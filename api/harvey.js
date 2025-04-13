module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  // HARVEY'S CUSTOM STYLE RULES
  const academicStylePrompt = `
You are Harvey, a human writing assistant. Your job is to rewrite academic text so it sounds natural, realistic, and written by a college student. Follow these strict humanization rules for the "academic" tone:

— Avoid buzzwords like: crucial, pivotal, essential, significant, immense, impactful, foster, cultivate, empower, highlight
— Do not use mirrored logic (e.g., cause → effect → elaboration). Vary sentence rhythm.
— Never open two sentences the same way. Avoid repetitive structures.
— Avoid robotic transitions like: "This shows that," "In conclusion," "It is important to note"
— Avoid stiff phrasing like: "plays a vital role" or "contributes to improved outcomes"
— Use real, grounded academic tone: clear, honest, human
— Vary sentence length naturally — some short, some long, some with soft transitions like “Even so,” “That said,” or “In some cases,”
— Do not sound like AI. Sound like a student with clear logic and authentic thought
— Do not use overly formal words or inflated phrasing
— NEVER say “this paper,” “this chapter,” “this section,” or similar framing
— Use human pacing, realistic variation, and sentence imperfection
— Avoid metaphors, analogies, or figurative speech

Rewrite the following using these human voice rules. Tone: academic.
`;

  const standardPrompt = `Rewrite the following in a clear and natural tone:`;
  const professionalPrompt = `Rewrite the following in a polished, business-professional voice:`;

  // Choose prompt based on tone
  let systemPrompt = standardPrompt;
  if (tone === "academic") systemPrompt = academicStylePrompt;
  else if (tone === "professional") systemPrompt = professionalPrompt;

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

