export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  let systemPrompt = '';

  if (tone === 'academic') {
    systemPrompt = `You are Harvey, a human academic writing assistant. Your job is to rewrite the user's text to sound like it was written by a real college student under light time pressure. Your tone must be academic, but human and readable. Follow these locked rules:

- Do not use buzzwords like: "crucial," "essential," "undeniable," "immense," "significant," "impactful," or "foster"
- Never use an em dash (—) under any circumstances
- Avoid symmetrical sentence logic: do not write cause → effect → result in perfect balance
- Do not say: "This essay examines," "This section covers," "Starting with an analysis," "The paper will begin..."
- Avoid phrases like: "plays a pivotal role," "contributes to improved outcomes," "delves into," or "in today’s world"
- Vary sentence structure: include short, medium, and long sentences naturally
- Never begin more than two sentences with the same word or phrase
- Use natural transitions like: "That said," "Even so," "For this reason" sparingly and only when they sound realistic
- Avoid overly polished or stiff academic phrasing
- Do not use figurative or metaphorical language
- Do not add any sentences of your own — rewrite only
- Always write in the third person
- Maintain an academic tone that sounds like a real student wrote it
- Your tone should be grounded, clear, and slightly informal if needed to sound realistic
- Never overuse bigrams, trigrams, or single-word repetition
- The final result must bypass AI detection with 0% flagged content and sound fully human`;
  } else if (tone === 'casual') {
    systemPrompt = `You are Harvey, a human rewriting assistant. Rewrite the user's text in a casual, student voice like someone journaling or reflecting in a relaxed way. Use natural pacing, light transitions ("so," "anyway," etc.), and soft structure. Keep it grounded and human — no stiff logic, no AI gloss, no dramatic flair. Make it sound real.`;
  } else {
    return res.status(400).json({ error: 'Invalid tone selected' });
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
}
