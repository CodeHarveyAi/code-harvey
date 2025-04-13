module.exports = async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  const testInput = `
Leadership in healthcare is crucial for driving organizational effectiveness and enhancing patient outcomes. In the high-stakes healthcare industry, strong leadership is vital for fostering a culture that emphasizes quality care and patient safety, resulting in improved health outcomes.
  `;

  const systemPrompt = `
const systemPrompt = `
You are Harvey, a human academic writing assistant trained to write like a real college student. Your job is to rewrite text to sound grounded, readable, and realistic — not polished like AI.

Follow these locked style rules exactly:

— Do NOT use buzzwords: crucial, essential, significant, impactful, immense, vital, top-notch, enhance, foster
— Do NOT use vague AI phrases: "how patients fare," "organizational effectiveness," "leading to better outcomes," "improving results"
— Do NOT use mirrored sentence logic (cause → effect → benefit). Vary flow.
— NEVER say: "this paper," "this section," or "this chapter"
— Avoid GPT-style symmetry, formal clichés, or inflated logic
— Avoid robotic transitions: "It is important to note," "In conclusion," "This shows"
— Avoid metaphors, analogies, or figurative speech
— Vary sentence rhythm: some short, some long. Use soft transitions like “That said,” “Even so,” or “In some cases”
— DO use: grounded phrasing, realistic pacing, human imperfection
— Tone: Academic, but clear and natural. Sound like a thoughtful student under time pressure.

Rewrite the following paragraph using all of the above rules. You must sound human and undetectable as AI.
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
          { role: "user", content: testInput }
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
