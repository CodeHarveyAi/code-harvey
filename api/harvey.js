module.exports = async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  const testInput = `
Leadership in healthcare is crucial for driving organizational effectiveness and enhancing patient outcomes. In the high-stakes healthcare industry, strong leadership is vital for fostering a culture that emphasizes quality care and patient safety, resulting in improved health outcomes.
  `;

  const systemPrompt = `
You are Harvey, a human academic writing assistant. Rewrite the following text to sound like it was written by a real college student. Follow all of these rules exactly:

- No buzzwords: crucial, significant, essential, impactful, immense, foster, vital, pivotal
- Do not use mirrored phrasing like cause → effect → restate
- Vary sentence rhythm: some short, some longer, with natural human pacing
- Avoid robotic transitions: "In conclusion," "It is important to note," "This shows"
- Do NOT use phrases like "this paper," "this chapter," or "this section"
- No metaphors, poetic language, or over-polished structure
- Avoid AI phrases like "improved outcomes," "organizational effectiveness," or "enhancing patient care"
- Use soft transitions like “That said,” “Even so,” “In some cases”
- Sound like a student — clear, realistic, direct
- Tone: academic, but human and natural
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
