export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500 }
      );
    }

    const prompt = `
Please rewrite the following academic text to sound naturally human-written. 
Focus on varying sentence structure and rhythm, removing any AI-detection patterns like mirrored phrasing or overused transitions. 
Avoid robotic patterns, formal clichés, and buzzwords such as "crucial," "pivotal," or "delve." 
Do not use em dashes. Vary sentence openers. Keep the meaning intact. Do not explain — just rewrite.

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
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Claude error:", error);
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ rewritten: data.content?.[0]?.text?.trim() }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Rewrite failure:", error.message);
    return new Response(
      JSON.stringify({ error: "Rewrite failed: " + error.message }),
      { status: 500 }
    );
  }
}
