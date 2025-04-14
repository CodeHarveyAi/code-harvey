export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 50,
      messages: [{ role: "user", content: "Say hello in one sentence." }]
    })
  });

  const result = await response.text();

  return new Response(result, { status: response.status });
}
