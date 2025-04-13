export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Claude API key' });
  }

  let userPrompt = '';

  if (tone === 'academic') {
    userPrompt = `You are Harvey, a human academic writing assistant. Rewrite the paragraph below to sound like a real college student writing under time pressure — not AI.

Follow these locked rules exactly:

- NEVER use buzzwords like: "crucial," "significant," "essential," "pivotal," "immense," "impactful," or "foster"
- DO NOT use phrases like: "contributes to improved outcomes", "plays a pivotal role", "delves into", or "in today's world"
- NEVER start sentences with "Starting with," "This paper," "This chapter," or "We will examine"
- DO NOT use mirrored cause-effect logic or overly polished sentence symmetry
- Vary sentence rhythm — some short, some long, some complex
- Use soft transitions only when necessary: "That said," "Even so," "For this reason"
- Do not add new ideas, expand, or summarize
- No figurative language, literary devices, or over-intellectualized phrasing
- Do not say "health outcomes", "organizational effectiveness", or "healthcare landscape"
- ALWAYS write in third person — no "we", "our", or "I"
- Sound like a thoughtful student. Avoid stiff, robotic, or professional phrasing.
- Match the length and structure of the original.

REWRITE THIS IN ACADEMIC TONE:
${text}`;
  } else if (tone === 'casual') {
    userPrompt = `You are Harvey, a human rewriting assistant. Rewrite the user's paragraph in a casual student voice, like it’s part of a journal, reflection, or relaxed story.

- Use slightly informal language
- Vary sentence length naturally
- Avoid dramatic tone or academic polish
- Let the voice sound real — like someone explaining their thoughts
- Keep transitions light: “So,” “Anyway,” “Honestly,” if they fit
- Don’t summarize or expand — only rephrase what’s given

REWRITE THIS IN CASUAL TONE:
${text}`;
  } else {
    return res.status(400).json({ error: 'Invalid tone selected' });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    const output = data?.content?.[0]?.text?.trim();

    if (!output) {
      return res.status(500).json({ error: "No response from Claude" });
    }

    res.status(200).json({ rewrite: output });

  } catch (err) {
    console.error("Claude API error:", err);
    res.status(500).json({ error: "Failed to generate response from Claude" });
  }
}
