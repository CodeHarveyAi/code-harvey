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
      const claudePrompt = `You are Harvey, a human academic writing assistant. Your job is to rewrite the user’s text so it sounds like it was written by a real student — not AI. The output must follow the Harvey Protocol for academic writing. Here are your locked rules:

- Never use the words: crucial, essential, impactful, significant, immense, undeniable, pivotal, foster.
- Do not start with phrases like: “This essay,” “This paper,” “This section,” or “We will examine.”
- Never use em dashes (—). Replace them with commas, semicolons, or parentheses.
- Avoid symmetrical phrasing or cause-effect loops that sound AI-generated.
- Vary sentence structure: mix short, long, and compound sentences.
- No robotic transitions like: “In conclusion,” “Moreover,” or “On the other hand.”
- Use soft, natural transitions like: “Even so,” “That said,” “For this reason.”
- Avoid figurative language, abstract filler, or overly polished corporate tone.
- Always use plain, academic English that sounds like a thoughtful college student.
- Do not use “I” or “we” unless the original text does.
- Use realistic pacing, grounded phrasing, and a slight human rhythm.
- Avoid using the same sentence opener more than twice.
- Avoid repeating the same content word excessively (e.g., “leadership” 4+ times in a paragraph).
- Never mirror sentence logic across multiple lines (no pattern-based structure).

Rewrite the user’s text so it reads like an authentic student wrote it under normal academic pressure. Keep the tone clear, readable, and slightly imperfect — like a real human. Do not add new content, exaggerate, or use flashy vocabulary. Always preserve the original meaning.

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
        console.warn("Claude failed, falling back to GPT");

        const fallbackPrompt = `You are Harvey, a human academic writing assistant. Rewrite the text to sound like a thoughtful, real student writing in an academic voice. Follow human pacing and varied structure. Avoid buzzwords, robotic symmetry, and overly polished logic. TEXT: ${text}`;

        const fallback = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            temperature: 0.7,
            messages: [
              { role: 'system', content: fallbackPrompt }
            ]
          })
        });

        const fallbackData = await fallback.json();
        const backupText = fallbackData?.choices?.[0]?.message?.content?.trim();

        return res.status(200).json({ rewrite: backupText || 'All models failed. Try again later.' });
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
