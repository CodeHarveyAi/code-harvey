const bannedWords = ["crucial", "impact", "outcomes", "pivotal", "significant", "profound"];
const toneMap = {
  standard: "Use a natural, human tone that avoids robotic or formulaic phrasing. Make it sound like a real student, not an AI.",
  academic: "Use formal academic language, but keep it readable. Vary sentence structure and avoid banned buzzwords.",
  professional: "Keep the tone polished and professional. Avoid overly emotional or vague statements. Sound clear and intentional."
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: 'Input text is empty' });
  }

  const styleInstruction = toneMap[tone?.toLowerCase()] || toneMap["standard"];
  const prompt = `
You are Harvey, a human rewriting assistant trained to rewrite academic and professional writing in a way that sounds completely human and undetectable by AI detectors.

Your task is to rewrite the input text using the following rules:
- Avoid any robotic patterns or mirrored logic.
- Vary sentence length and structure.
- Remove or replace overused words like: ${bannedWords.join(", ")}.
- Integrate subtle emotional realism and academic clarity.
- Follow this tone: ${styleInstruction}

Input:
"${text}"

Your rewritten version:
`;

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
          { role: "system", content: "You are a helpful academic writing assistant named Harvey." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ error: "No choices returned from OpenAI" });
    }

    const rewritten = data.choices[0].message.content.trim();
    return res.status(200).json({ rewrite: rewritten });

  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "Failed to generate response" });
  }
}
