export async function POST(req) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key" }), { status: 500 });
    }

    const prompt = `
Please rewrite the following academic text to sound naturally human-written. 
Focus on varying sentence structure and rhythm. Avoid robotic patterns, mirrored phrasing, and generic transitions. 
Keep the original meaning intact. Do not add anything new. Do not explain your changes. Just return the rewritten version.

Text:
${text}
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
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const result = await response.json();

    const rewrittenText = result?.content?.[0]?.text?.trim() || "No rewrite returned.";

    return new Response(JSON.stringify({ rewritten: rewrittenText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Rewrite error:", err);
    return new Response(JSON.stringify({ error: "Failed to rewrite text." }), { status: 500 });
  }
}
