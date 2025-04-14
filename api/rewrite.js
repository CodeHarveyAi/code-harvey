// pages/api/rewrite.js (Next.js)
const fetch = require('node-fetch');

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
    const prompt = `
Please rewrite the following academic text to sound naturally human-written. 
Focus on varying sentence structure and rhythm, removing any AI-detection patterns like mirrored phrasing or overused transitions. 
Maintain the original meaning and tone, but make the writing more fluid and realistic, as if written by a college student. 
Avoid robotic patterns, formal clichés, and buzzwords like "crucial," "pivotal," or "delve."
Use no em dashes. Vary sentence openers. Prioritize natural rhythm and subtle variation. 
Do not add extra ideas — just rewrite with clarity, flow, and human pacing. 
No need to state what you're doing — just return the rewritten text.

Original Text:
${inputText}
    `.trim();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (!data.content || data.content.length === 0) {
      throw new Error('Empty response from API');
    }

    return res.status(200).json({
      rewritten: data.content[0].text.trim()
    });

  } catch (error) {
    console.error('Rewrite error:', error);
    return res.status(500).json({
      error: 'Failed to rewrite text: ' + error.message
    });
  }
}
