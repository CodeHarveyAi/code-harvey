import { NextResponse } from 'next/server'

export async function POST(req) {
  const { text, tone } = await req.json()

  const apiKey = process.env.OPENAI_API_KEY
  const url = 'https://api.openai.com/v1/chat/completions'

  const bannedWords = [
    'crucial', 'essential', 'impactful', 'underscores', 'groundbreaking', 'empower',
    'pivotal', 'foster', 'enhance', 'critical', 'robust', 'transform',
    'nuanced', 'interplay', 'illuminate', 'delve', 'framework', 'interconnected',
    'interwoven', 'navigate', 'insight', 'dynamic', 'domain', 'endeavor',
    'facilitate', 'promote', 'holistic', 'comprehensive', 'myriad', 'landscape',
    'notion', 'sphere', 'realm', 'showcase', 'shed light', 'unveil',
    'leveraged', 'empirical', 'paradigm', 'aforementioned', 'therein', 'aforethought',
    'outcomes', 'optimize', 'solution', 'leverage', 'key takeaway', 'game-changer'
  ]

  const prompt =
    tone === 'academic'
      ? `Rewrite this academic text in a clear and human voice, using formal structure but avoiding unnatural phrases. Do not use these words: ${bannedWords.join(", ").slice(0, 300)}. Text: ${text}`
      : `Rewrite this in a natural tone. You may use personal voice like \"I\" or \"we\" if it fits, but avoid words like: ${bannedWords.join(", ").slice(0, 300)}. Text: ${text}`

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  const body = {
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const json = await response.json()
    const rewritten = json?.choices?.[0]?.message?.content || 'No rewrite returned.'
    return NextResponse.json({ rewritten })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ rewritten: 'Error contacting OpenAI.' }, { status: 500 })
  }
}
