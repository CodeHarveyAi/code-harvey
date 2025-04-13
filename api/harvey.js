module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing Claude API key' });
  }

  const prompt = `
Human: Rewrite the following paragraph using these locked tone rules:

— No buzzwords like: crucial, essential, significant, impactful, top-notch, immense, foster
— Do not use vague AI phrases like: "organizational effectiveness", "improving outcomes", or "how patients fare"
— Do not use mirrored logic or robotic structure (e.g., cause → effect → result)
— Avoid transitions like: "It is important to note", "In conclusion", "This shows"
— Never say: "this paper", "this section", "this chapter"
— No metaphors, analogies, or figurative language
— Use varied sentence length and realistic academic tone
— Sound like a real student writing under timed conditions. Natural rhythm. Academic, but grounded.

Paragraph:
${text}

Assistant:
`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/complete", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-1.2",
        max_tokens_to_sample: 800,
        prompt: prompt,
        stop_sequences: ["\n\nHuman:"]
      })
    });

    const data = await response.json();

    if (!data.completion) {
      return res.status(500).json({ error: "No response from Claude" });
    }

    res.status(200).json({ rewrite: data.completion.trim() });

  } catch (err) {
    console.error("Claude API error:", err);
    res.status(500).json({ error: "Failed to generate response from Claude" });
  }
};
