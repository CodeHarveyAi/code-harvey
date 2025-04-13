export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  console.log("📩 Input Received:", { text, tone });

  if (!apiKey) {
    console.error("❌ Missing OpenAI API key");
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  try {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Rewrite the following in a ${tone} tone.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7
    };

    console.log("📤 Payload Sent to OpenAI:", payload);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("📥 OpenAI API Response:", data);

    if (!data.choices || !data.choices[0]) {
      console.error("⚠️ No choices returned from OpenAI:", data);
      return res.status(500).json({ error: "No response from OpenAI" });
    }

    res.status(200).json({ rewrite: data.choices[0].message.content.trim() });

  } catch (err) {
    console.error("🔥 Error calling OpenAI:", err);
    res.status(500).json({ error: "Failed to generate response" });
  }
}
