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

  const bannedWords = [
    'crucial', 'essential', 'impactful', 'underscores', 'groundbreaking', 'empower',
    'pivotal', 'foster', 'enhance', 'critical', 'robust', 'transform',
    'nuanced', 'interplay', 'illuminate'
  ];

  function containsBannedWords(text) {
    const lowerText = text.toLowerCase();
    return bannedWords.some(word => lowerText.includes(word));
  }

  try {
    if (tone === 'academic') {
      const claudePrompt = `
Rewrite the following paragraph so it sounds like it was written by a real college student under time pressure. Follow these rules strictly:

1. NEVER use any of these words: crucial, essential, impactful, huighlight, immense, undeniable, pivotal, foster, support, critical, robust, transform, nuanced, interplay, illuminate, delve.
2. NEVER say "This paper," "This essay," or "This section." Avoid generic or academic framing.
3. DO NOT add ideas, commentary, summaries or rephrased conclusions. Avoid framing the topic more broadly than the original text.
4. Match the original number of sentences as closely as possible. Stay within the same word count range.
5. No mirrored sentence structures (avoid cause → effect → elaboration symmetry).
6. Avoid transitions like "Moreover," "Therefore," or "In conclusion."
7. Do NOT use em dashes — use commas or periods instead.
8. Do NOT use metaphor, abstract intensity, or figurative phrasing.
9. Vary sentence length: some short, some long, some compund, some complex, or am in between.
10. Keep the tone academic but realistic — like a student trying to write clearly under deadline.
11. Always write in third person. Never use "I," "we," or "you."
12. Return ONLY the rewritten paragraph. Do NOT include commentary, explanations, or extra sentences.
13. Keep sentences straightforward and natural. Avoid academic buzz or abstract generalizations — aim for clarity, like how a thoughtful student would explain it to a classmate.
14. Do not invent framing sources like ‘research suggests’ unless they are present in the original paragraph.

TEXT: ${text}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20250219',
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

      if (containsBannedWords(rewrittenText)) {
        // fallback to GPT
        const fallbackPrompt = `Rewrite the following paragraph using plain academic tone. Do not add new content, commentary, or summary. Avoid robotic phrasing and these banned words: ${bannedWords.join(", ")}. Match sentence count and stay within original word range. TEXT: ${text}`;

        const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

        const fallbackData = await fallbackResponse.json();
        const fallbackText = fallbackData?.choices?.[0]?.message?.content?.trim();

        if (!fallbackText) {
          return res.status(200).json({ rewrite: 'Fallback failed — try again in a moment.' });
        }

        return res.status(200).json({ rewrite: fallbackText });
      }

      return res.status(200).json({ rewrite: rewrittenText });
    }

    if (tone === 'casual') {
      const chatPrompt = `You are Harvey, a human rewriting assistant. Rewrite the user’s text to sound like a real student writing casually — like a reflection, journal entry, or story. Follow these rules:

- Use a natural, relaxed tone (not stiff or polished).
- Include light transitions like “Anyway,” or “Honestly” if they fit.
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
