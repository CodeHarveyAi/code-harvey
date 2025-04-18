import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const input = req.body.prompt || req.body.text;
  const claudeKey = process.env.ANTHROPIC_API_KEY;

  if (!input) {
    return res.status(400).json({ error: 'Missing required input text' });
  }

  if (!claudeKey) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  const bannedWords = [
    'crucial', 'essential', 'impactful', 'underscores', 'groundbreaking', 'empower',
    'pivotal', 'foster', 'enhance', 'critical', 'robust', 'transform',
    'nuanced', 'interplay', 'illuminate', 'delve', 'framework', 'interconnected',
    'interwoven', 'navigate', 'insight', 'dynamic', 'sheds light', 'lens'
  ];

  const claudePrompt = `
You are Harvey, a human academic writing assistant. Rewrite the following paragraph to sound like it was written by a real college student under time pressure. Follow all instructions exactly:

1. DO NOT use these words: ${bannedWords.join(', ')}.
2. DO NOT add new ideas, summaries, or conclusions. Rephrase only what's already in the original text.
3. Keep the meaning and number of sentences the same or as close as possible.
4. Vary sentence length to sound natural -- use short, medium, and long sentences.
5. Avoid mirrored sentence structures like cause → effect → elaboration.
6. Never use phrases like "This paper," "This section," or "will examine."
7. DO NOT use robotic transitions like "Moreover," "Therefore," or "In conclusion."
8. DO NOT use em dashes (--). Use commas or periods instead.
9. DO NOT use figurative language or abstract intensity.
10. Use clear, grounded phrasing -- no buzzwords or corporate jargon.
11. Always write in third person -- never use "I," "we," or "you."
12. Make it sound readable and realistic -- like a student trying to finish a paper on time.
13. Do not mention scholars, data, studies, or research unless it appeared in the original.
14. Keep it in a plain academic voice -- easy to understand, no advanced academic tone.
15. Output ONLY the rewritten paragraph -- no commentary or explanation.

TEXT TO REWRITE:
${input}`.trim();

  try {
    const anthropic = new Anthropic({ apiKey: claudeKey });

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      messages: [{ role: 'user', content: claudePrompt }]
    });

    const rewritten = response?.content?.[0]?.text?.trim();

    if (!rewritten || rewritten.startsWith('Here is')) {
      return res.status(200).json({ rewrite: 'Claude is thinking too hard... try again in a moment!' });
    }

    return res.status(200).json({ rewrite: rewritten });
  } catch (error) {
    console.error('Harvey error:', error);
    return res.status(500).json({ error: 'Rewrite failed: ' + error.message });
  }
}
