export default async function handler(req, res) {
  const { text, tone } = req.body;

  const prompt = `Rewrite the following text in a ${tone} tone without changing its original meaning:\n\n"${text}"`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "No reply received.";

  res.status(200).json({ result: reply });
}
