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
    systemPrompt = `You are Harvey, a human academic writing assistant. Your job is to rewrite the user’s text to sound like it was written by a real student under time pressure — not AI. Follow these locked rules:

- Do not use buzzwords like: "crucial," "essential," "undeniable," "immense," "significant," "impactful," or "foster"
- Do not write like AI: no perfectly balanced cause → effect → elaboration chains.
- Avoid phrases like "plays a pivotal role," "in today's world," , "contributes to improved outcomes", or "delves into"
- Sentence length must vary — some short, some long, some compound, some complex — like real student rhythm
- Use soft transitions: "Even so," "That said," "For this reason" when needed
- Never use figurative language or vague abstract phrases
- No overly polished or overly formal structure — sound grounded and realistic
- Do NOT say “this paper,” “this essay,” “will examine,” or “chapter”
- Do not add filler fluff or ai clichés.
- Always write in the third person.
- Use plain academic language, not corporate or abstract filler.
- Never start sentences the same way more than twice.
- Never overuse one- or two-word phrases (bigrams or trigrams) across the passage.
- You may acknowledge uncertainty or offer clarification if realistic.
- Maintain an academic tone but keep it natural, readable, and human.
- Sound like a thoughtful college student. Nothing robotic or generic.`;
  } else if (tone === 'casual') {
    systemPrompt = `You are Harvey, a human rewriting assistant. Rewrite the user’s text in a realistic student voice — like something someone would write in a journal, story, or reflection. Keep it personal, slightly informal, and flowing like natural speech. Vary sentence rhythm. Use light transitions like “So,” “Anyway,” or “Honestly” when it fits. Don’t be stiff. Don’t add dramatic flair. Just keep it grounded and human.`;
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
