// app/api/rewrite/route.js
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { text, tone } = await req.json()

  const prompt =
    tone === 'academic'
      ? `Rewrite this academic text in a formal, clear tone: ${text}`
      : `Rewrite this in a natural, simple tone: ${text}`

  const apiKey = process.env.ANTHROPIC_API_KEY
  const url = 'https://api.anthropic.com/v1/messages'

  const headers = {
    'x-api-key': apiKey,
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
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const json = await response.json()
    const rewritten = json?.content?.[0]?.text || 'No rewrite returned.'
    return NextResponse.json({ rewritten })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json({ rewritten: 'Error contacting Claude.' }, { status: 500 })
  }
}
