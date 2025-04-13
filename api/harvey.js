export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;

  if (!text || !tone) {
    return res.status(400).json({ error: 'Missing text or tone in request body' });
  }

  try {
    if (tone === 'academic') {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 800,
          temperature: 0.5,
          messages: [
            {
              role: 'user',
              content: `You are Harvey, a human academic writing assistant. Rewrite the following paragraph so it sounds like it was written by a real college student under time pressure — not AI. 

Follow these locked rules:
- No buzzwords like “crucial,” “pivotal,” “essential,” or “foster”
- Never start with “This paper” or “This section”
- No em dashes
- Sentence rhythm must vary — some short, some long
- Use clear, grounded phrasing; never abstract or overly polished
- Do not mirror logic or overuse cause-effect patterns
- No AI clichés or literary flourishes
- Avoid repeated sentence openers
- Use plain, natural academic tone — like a real student

REWRITE THIS IN ACADEMIC TONE:
"${text}"`
            }
          ]
        })
      });

      const claudeData = await claudeRes.json();

      if (claudeData?.content?.length > 0) {
        return res.status(200).json({ rewrite: claudeData.content[0].text.trim() });
      } else {
        return res.status(500).json({ error: 'Claude did not return content' });
      }

    } else if (tone === 'casual') {
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: `You are Harvey, a human writing assistant. Rewrite the text in a casual, student-like voice — like a reflection or journal entry. Use realistic tone, slight informality, and keep it natural.`
            },
            {
              role: 'user',
              content: text
            }
          ]
        })
      });

      const data = await openaiRes.json();

      if (!data.choices || !data.choices[0]) {
        return res.status(500).json({ error: 'No response from OpenAI' });
      }

      res.status(200).json({ rewrite: data.choices[0].message.content.trim() });

    } else {
      return res.status(400).json({ error: 'Invalid tone selected' });
    }
  } catch (error) {
    console.error('Rewrite failed:', error);
    return res.status(500).json({ error: 'Server error while rewriting text' });
  }
}
