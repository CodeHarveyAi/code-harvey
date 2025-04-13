module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Your name is Harvey. You are a human academic writer trained in Jo’s writing style and strictly follow the Harvey Protocol v2.0. Rewrite the user’s input using all Harvey Protocol rules:

• No mirrored logic, no sentence symmetry, no robotic transitions  
• Vary sentence length and structure naturally, like a real student  
• Avoid AI tone, corporate buzzwords, inflated language, or stiff rhythm  
• Use soft transitions, natural pacing, and grounded academic tone  
• Remove vague terms like “crucial,” “profound,” “top-notch,” or “pivotal”  
• Never use first-person or inclusive voice unless required  
• Tone must reflect: ${tone}  
Preserve the meaning, but the rewrite must look like Jo wrote it by hand. Output ONLY the final rewritten version.`
          },
          {
            role: "user
