export async function POST(req) {
  const { input } = await req.json();

  // 🔁 Send text to detox scanner (Claude-style logic endpoint)
  const response = await fetch("http://localhost:8000/detox", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input })
  });

  const data = await response.json();

  // 🔎 Defensive checks
  if (!data || typeof data !== "object") {
    return new Response(JSON.stringify({ error: "Phase 6.5 failed: invalid response structure" }), { status: 500 });
  }

  const flagsFound = data.flags?.length || 0;
  const percentChanged = parseInt(data.stats?.percentChanged || 0);

  // ❌ Reject if not human enough
  if (flagsFound > 0 || percentChanged < 10) {
    return new Response(
      JSON.stringify({
        blocked: true,
        reason: "Phase 6.5 blocked output for robotic patterns or low rewrite percentage.",
        flags: data.flags || [],
        stats: data.stats || {}
      }),
      { status: 400 }
    );
  }

  // ✅ Pass-through if clean
  return new Response(JSON.stringify({ output: data.output }));
}
