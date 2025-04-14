const { Anthropic } = require('@anthropic-ai/sdk');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const inputText = req.body.text;
  if (!inputText) {
    return res.status(400).json({ error: 'Missing text to rewrite' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const messagesPrompt = [
      {
        role: "user",
        content: `
Please rewrite the following academic text to sound naturally human-written. 
Focus on varying sentence structure and rhythm, removing any AI-detection patterns like mirrored phrasing or overused transitions. 
Avoid robotic patterns, formal clichés, and buzzwords such as "crucial," "pivotal," or "delve." 
Do not use em dashes. Vary sentence openers. Keep the meaning intact. Do not explain — just rewrite.

Text:
${inputText}
        `.trim()
      }
    ];

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        messages: messagesPrompt,
      });

      return res.status(200).json({
        rewritten: response.content?.[0]?.text?.trim() || "(No output from Claude)"
      });
    } catch (err) {
      const fallbackPrompt = `
Human: Rewrite the following academic text to sound naturally human-written. 
Focus on varying sentence structure and rhythm. Remove mirrored phrasing and overused transitions. 
Avoid robotic logic, formal clichés, and buzzwords like "crucial" or "pivotal." 
Use no em dashes. Vary sentence openers. Keep the meaning the same. Don't explain — just rewrite.

Text: ${inputText}

Assistant:
      `.trim();

      const response = await anthropic.completions.create({
        model: "claude-2.0",
        prompt: `\n\n${fallbackPrompt}`,
        max_tokens_to_sample: 2000,
        stop_sequences: ["\n\nHuman:"],
      });

      return res.status(200).json({
        rewritten: response.completion?.trim() || "(No output from fallback model)"
      });
    }

  } catch (error) {
    console.error('Rewrite error:', error);
    return res.status(500
