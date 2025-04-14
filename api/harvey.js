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
Rewrite the user's text to sound like a thoughtful college student writing under pressure. It should not sound like AI. Follow these locked rules exactly:

1. NEVER use banned words: crucial, essential, impactful, significant, immense, undeniable, pivotal, foster, support, critical.
2. NEVER use mirrored sentence structure (cause → effect → elaboration).
3. NEVER start with: "This essay," "This paper," "This section," or "We will examine."
4. NEVER use em dashes. Use commas, semicolons, or parentheses.
5. NEVER use generic AI transitions like: Moreover, Therefore, In conclusion, etc.
6. NEVER include lists, markdown, commentary, or explanations — ONLY return the final rewritten paragraph.
7. NEVER repeat the same word or phrase more than twice.
8. Vary sentence rhythm: mix short, long, compound, and complex naturally.
9. Use grounded academic phrasing — NO corporate or abstract filler.
10. Use third-person academic tone. No first-person or second-person unless in original.

Return only ONE clean, natural academic paragraph. Do not explain, summarize, or comment.

TEXT: ${text}`;

      let rewrittenText = '';
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 2000,
            messages: [
              { role: 'user', content: claudePrompt }
            ]
          })
        });

        const data = await response.json();
        rewrittenText = data?.content?.[0]?.text?.trim();
      } catch (e) {
        console.warn('Claude API failed:', e.message);
      }

      if (!rewrittenText) {
        // Retry Claude one time before fallback
        try {
          const retryResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': claudeKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              model: 'claude-3-5-haiku-20241022',
              max_tokens: 2000,
              messages: [
                { role: 'user', content: claudePrompt }
              ]
            })
          });
          const retryData = await retryResponse.json();
          rewrittenText = retryData?.content?.[0]?.text?.trim();
        } catch (retryErr) {
          console.warn('Claude retry also failed:', retryErr.message);
        }
      }

      // Fallback to GPT-4 if Claude still fails
      if (!rewrittenText) {
        const gptFallbackPrompt = `You are Harvey, a human academic writing assistant. Rewrite the user's text in academic student voice under time pressure. Rules:

- Avoid: crucial, essential, impactful, significant, immense, undeniable, pivotal, foster, critical, illuminate, nuanced, framework, transform, 
- No mirrored phrasing or AI-style transitions
- Vary sentence length and rhythm
- Avoid phrases like "this paper," "this section," or "delves into"
- Never use em dashes — use commas or semicolons
- Keep a grounded, human tone with light transitions if needed
- Output only a clean paragraph — no commentary or explanations

TEXT: ${text}`;

        const fallbackRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            temperature: 0.7,
            messages: [
              { role: 'system', content: gptFallbackPrompt }
            ]
          })
        });

        const fallbackData = await fallbackRes.json();
        rewrittenText = fallbackData?.choices?.[0]?.message?.content?.trim();
      }

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
      let rewrittenText = data?.choices?.[0]?.message?.content?.trim();

      if (!rewrittenText) {
        // Fallback to gpt-3.5-turbo if GPT-4 fails
        const gpt3Res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            messages: [
              { role: 'system', content: chatPrompt }
            ]
          })
        });
        const gpt3Data = await gpt3Res.json();
        rewrittenText = gpt3Data?.choices?.[0]?.message?.content?.trim();
      }

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
