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
    'nuanced', 'interplay', 'illuminate', 'delve', 'framework', 'interconnected',
    'interwoven', 'navigate', 'insight', 'dynamic', 'sheds light', 'lens'
  ];

  function containsBannedWords(text) {
    const lowerText = text.toLowerCase();
    return bannedWords.some(word => lowerText.includes(word));
  }

  try {
   if (tone === 'academic') {
  const claudePrompt = `
You are Harvey, a human academic writing assistant. Rewrite the following paragraph to sound like it was written by a real college student under time pressure. Follow all instructions exactly:

1. DO NOT use these words: crucial, essential, impactful, highlight, immense, undeniable, pivotal, foster, support, critical, robust, transform, nuanced, interplay, illuminate, delve, framework, interconnected, interwoven, navigate, insight, dynamic, sheds light, lens.
2. DO NOT add new ideas, summaries, or conclusions. Rephrase only what's already in the original text.
3. Keep the meaning and number of sentences the same or as close as possible.
4. Vary sentence length to sound natural — use short, medium, and long sentences.
5. Avoid mirrored sentence structures like cause → effect → elaboration.
6. Never use phrases like “This paper,” “This section,” or “will examine.”
7. DO NOT use robotic transitions like “Moreover,” “Therefore,” or “In conclusion.”
8. DO NOT use em dashes (—). Use commas or periods instead.
9. DO NOT use figurative language or abstract intensity.
10. Use clear, grounded phrasing — no buzzwords or corporate jargon.
11. Always write in third person — never use “I,” “we,” or “you.”
12. Make it sound readable and realistic — like a student trying to finish a paper on time.
13. Do not mention scholars, data, studies, or research unless it appeared in the original.
14. Keep it in a plain academic voice — easy to understand, no advanced academic tone.
15. Output ONLY the rewritten paragraph — no commentary or explanation.

TEXT TO REWRITE:
${text}
`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: claudePrompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    // Log full error message if Claude fails
    if (!data || data.error || !data.content || !data.content[0]?.text) {
      console.error('Claude error:', data);
      throw new Error('Claude failed');
    }

    const rewrittenText = data.content[0].text.trim();

    if (!rewrittenText || rewrittenText.startsWith('Here is')) {
      return res.status(200).json({ rewrite: 'Claude is thinking too hard... try again in a moment!' });
    }

    if (containsBannedWords(rewrittenText)) {
      const fallbackPrompt = `Rewrite the following paragraph using plain academic tone. Do not add new content, commentary, or summary. Avoid robotic phrasing and these banned words: ${bannedWords.join(", ")}. Match sentence count and stay within original word range. TEXT: ${text}`;

      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          temperature: 0.5,
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

  } catch (error) {
    console.error('Claude catch block error:', error);

    // Trigger GPT fallback if Claude completely fails
    const fallbackPrompt = `Rewrite the following paragraph using plain academic tone. Do not add new content, commentary, or summary. Avoid robotic phrasing and these banned words: ${bannedWords.join(", ")}. Match sentence count and stay within original word range. TEXT: ${text}`;

    try {
      const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          temperature: 0.5,
          messages: [
            { role: 'system', content: fallbackPrompt }
          ]
        })
      });

      const fallbackData = await fallbackResponse.json();
      const fallbackText = fallbackData?.choices?.[0]?.message?.content?.trim();

      return res.status(200).json({ rewrite: fallbackText || 'Backup rewrite failed too. Please try again.' });

    } catch (fallbackError) {
      console.error('GPT fallback error:', fallbackError);
      return res.status(500).json({ error: 'Rewrite failed due to server error' });
    }
  }
}

}
