import { NextResponse } from 'next/server'

export async function POST(req) {
  const { text, tone } = await req.json()
  const prompt = tone === 'academic'
    ? `Rewrite this academic text in a formal, clear tone: ${text}`
    : `Rewrite this in a natural, simple tone: ${text}`

  const headers = {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  }

  const body = {
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }],
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const json = await res.json()
    const rewritten = json?.content?.[0]?.text || 'No rewrite returned.'
    return NextResponse.json({ rewritten })
  } catch (err) {
    return NextResponse.json({ rewritten: 'Claude error.' }, { status: 500 })
  }
}
