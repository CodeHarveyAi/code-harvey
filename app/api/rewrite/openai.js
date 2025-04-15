import { NextResponse } from 'next/server'

export async function POST(req) {
  const { text, tone } = await req.json()

  const apiKey = process.env.OPENAI_API_KEY
  const model = 'gpt-4' // or 'gpt-3.5-turbo' if you're using the cheaper version

  const prompt = tone === 'academic'
    ? `Rewrite this academic text using formal, human-like language without robotic phrasing or overused words: ${text}`
    : `Rewrite this text in a casual and natural tone, using realistic, human-like language: ${text}`

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.7,
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const json = await response.json()
    const rewritten = json?.choices?.[0]?.message?.content?.trim() || 'No rewrite returned.'
    return NextResponse.json({ rewritten })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ rewritten: 'Error contacting OpenAI.' }, { status: 500 })
  }
}
