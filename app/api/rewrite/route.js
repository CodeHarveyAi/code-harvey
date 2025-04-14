export async function POST(req) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key" }), { status: 500 });
    }

    const prompt = `
Please rewrite the following academic text to sound naturally human-written.
Avoid robotic structure, mirrored phrasing, and buzzwords. Keep the meaning unchanged.

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
    const rewritten = result?.content?.[0]?.text?.trim() || "No output received.";

    return new Response(JSON.stringify({ rewritten }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Optional: Handle GET so browser doesn’t 405
export async function GET() {
  return new Response("Rewrite endpoint is live. Use POST with JSON { text }.", {
    status: 200
  });
}
