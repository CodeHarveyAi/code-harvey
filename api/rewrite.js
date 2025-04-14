export default async function handler(req, res) {
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
Avoid robotic patterns, formal clichés, and buzzwords such as "crucial," "pivotal," or "delve." 
Do not use em dashes. Vary sentence openers. Keep the meaning intact. Do not explain — just rewrite.

Text:
${inputText}
    `.trim();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API Error:", errorData);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.content || data.content.length === 0) {
      throw new Error("Claude returned an empty response");
    }

    return res.status(200).json({
      rewritten: data.content[0].text.trim()
    });

  } catch (error) {
    console.error("Rewrite Error:", error.message);
    return res.status(500).json({
      error: "Rewrite failed: " + error.message
    });
  }
}
