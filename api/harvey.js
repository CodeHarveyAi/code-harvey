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
      const claudePrompt = `
Rewrite this paragraph so it sounds like it was written by a real college student — under pressure, in a realistic academic setting. Follow these strict rules:

1. Do NOT use any of these words: crucial, essential, impactful, significant, immense, undeniable, pivotal, foster, support, critical, robust, transform, nuanced, interplay, illuminate.
2. NEVER say "This paper," "This essay," or "This section." Avoid generic openings.
3. DO NOT use symmetrical sentence patterns like cause → effect → result.
4. Avoid polished transitions like "Moreover," "Therefore," or "In conclusion."
5. NEVER use em dashes — replace with commas or periods.
6. Do NOT use metaphor, analogy, or abstract intensity.
7. Vary sentence length — mix short, medium, and long. Mimic human pacing.
8. Use plain, grounded academic phrasing. Sound like a thoughtful but slightly rushed student.
9. Write in third person only. No "I" or "we."
10. Return ONLY the final rewritten paragraph. Do NOT explain or comment.

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

      if (!rewrittenText || rewrittenText.startsWith('Here is')) {
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
