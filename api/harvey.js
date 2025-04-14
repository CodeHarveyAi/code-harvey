export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const openAIKey = process.env.OPENAI_API_KEY;
  const claudeKey = process.env.ANTHROPIC_API_KEY;

  if (!text || !tone || !openAIKey || !claudeKey) {
    return res.status(400).json({ error: 'Missing required inputs or API keys' });
  }

  try {
    if (tone === 'academic') {
      const claudePrompt = `You are Harvey, a human academic writing assistant. Rewrite the user's text to sound like a thoughtful college student — not AI. You must follow these locked rules exactly:

- Never say "Here's a revision," "Rewritten version," or any form of commentary. Only return the rewritten paragraph. No explanations.
- Never use: crucial, essential, impactful, significant, immense, undeniable, pivotal, foster.
- Do not start with: "This essay," "This paper," "This section," or "We will examine."
- Never use em dashes (—). Use commas, semicolons, or parentheses instead.
- Avoid mirrored or symmetrical sentence structure.
- Vary sentence rhythm naturally: mix long, short, and compound sentences.
- No robotic transitions like: "Moreover," "On the other hand," or "In conclusion."
- Soft transitions like "Even so," "That said," or "For this reason" are okay if needed.
- Use grounded, academic phrasing — no corporate tone or abstract filler.
- Always write in third person unless original says otherwise.
- Avoid repeating the same opening or key word more than twice.
- Never add commentary, markdown formatting, lists, or bullet points.
- Only return a single clean paragraph that reflects natural academic human writing.
- Do not summarize or explain the revision. Just return the rewritten version — nothing more.

TEXT: ${text}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1000,
          messages: [
            { role: 'user', content: claudePrompt }
          ]
        })
      });

      const data = await response.json();
      const rewrittenText = data?.content?.[0]?.text?.trim();

      if (!rewrittenText) {
        return res.status(200).json({ rewrite: 'Claude is thinking too hard... try again in a moment!' });
      }

      return res.status(200).json({ rewrite: rewrittenText });
    }

    if (tone === 'casual') {
      const chatPrompt = `You are Harvey, a human rewriting assistant. Rewrite the user’s text to sound like a real student writing casually — like a reflection, journal entry, or story. Follow these rules:

- Use a natural, relaxed tone (not stiff or polished).
- Include light transitions like “So,” “Anyway,” or “Honestly” if they fit.
- Never use dramatic or formal phrasing.
- Vary sentence length and pacing.
- Sound like someone thinking out loud — not like an essay.
- Do not add anything new — just rephrase exactly what was written.
- Avoid literary devices, exaggeration, or perfect logic.
- Never use buzzwords or abstract intensity (e.g., impactful, critical, fundamental).
- Use contractions and simple language to reflect real student voice.
- Preserve the original meaning and intent.

TEXT: ${text}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          temperature: 0.7,
          messages: [
            { role: 'system', content: chatPrompt }
          ]
        })
      });

      const data = await response.json();
      const rewrittenText = data?.choices?.[0]?.message?.content?.trim();

      if (!rewrittenText) {
        return res.status(200).json({ rewrite: 'ChatGPT is on a coffee break... try again shortly!' });
      }

      return res.status(200).json({ rewrite: rewrittenText });
    }

    return res.status(400).json({ error: 'Invalid tone selection' });
  } catch (error) {
    console.error('Harvey error:', error);
    return res.status(500).json({ error: 'Rewrite failed due to server error' });
  }
}
