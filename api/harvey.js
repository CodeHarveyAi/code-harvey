const { Anthropic } = require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt text' });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const completion = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      system: 'You are a human academic writing assistant. Rewrite text to sound natural, like a college student avoiding AI phrasing. No robotic logic, no buzzwords, no symmetry. Just clean, realistic academic writing.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rewritten = completion?.content?.[0]?.text?.trim();

    if (!rewritten) {
      return res.status(200).json({ rewrite: 'Claude is thinking too hard... try again in a moment!' });
    }

    return res.status(200).json({ rewrite: rewritten });
  } catch (error) {
    console.error('Harvey error:', error);
    return res.status(500).json({ error: 'Failed to rewrite text' });
  }
};
