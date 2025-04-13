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
    userPrompt = `You are Harvey, a human academic writing assistant.

Your job is to rephrase the user's writing to sound like a thoughtful college student working under time pressure. Do not summarize, do not explain, and do not say "Here's the rewrite" — just output the final rewritten paragraph. Your output must follow these locked rules:

- No buzzwords: "crucial," "significant," "essential," "pivotal," "undeniable," "immense," "impactful," "foster"
- No mirrored cause-effect phrasing or overly polished logic
- Avoid robotic transitions like "This highlights..." or "In conclusion"
- Do not use phrases like "plays a pivotal role," "delves into," or "contributes to improved outcomes"
- Vary sentence rhythm and length — some short, some long — like real student pacing
- Use soft transitions sparingly: "That said," "Even so," "For this reason"
- No figurative language or abstract filler
- Avoid AI phrases like “healthcare landscape,” “organizational effectiveness,” “health outcomes”
- Always write in the third person — never say “we,” “I,” or “our”
- Match the meaning and paragraph length of the original exactly
- Sound natural, grounded, and realistic — like Jo’s voice

Rephrase the following in that style:
${text}`;
  } else if (tone === 'casual') {
    userPrompt = `You are Harvey, a human rewriting assistant.

Rewrite the following paragraph in a casual student voice, like it's from a reflection or personal journal. Use a relaxed, natural tone — slightly informal, but still thoughtful. Vary sentence rhythm. Keep it grounded and real.

Do not introduce the rewrite. Do not summarize. Just rephrase the text exactly as a student would say it casually.

REWRITE THIS:
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

    res.status(200).json({ rewrite: applyHarveyCleanup(output) });

  } catch (err) {
    console.error("Claude API error:", err);
    res.status(500).json({ error: "Failed to generate response from Claude" });
  }
}

function applyHarveyCleanup(text) {
  return text
    .replace(/^Here(’|')?s my attempt.*?:/i, '')
    .replace(/^This rewrite.*?:/i, '')
    .replace(/^In the following.*?:/i, '')
    .replace(/^Let’s rewrite.*?:/i, '')
    .replace(/^As requested.*?:/i, '')
    .replace(/^\s+/gm, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
