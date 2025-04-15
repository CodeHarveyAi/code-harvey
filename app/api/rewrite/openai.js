import { NextResponse } from 'next/server'

const BANNED_WORDS = [
  'crucial', 'essential', 'impactful', 'pivotal', 'enhance',
  'foster', 'empower', 'nuanced', 'framework', 'navigate',
  'interconnected', 'delve', 'shed light', 'paint a picture',
  'holistic', 'robust', 'unlock', 'unlocking', 'dynamic', 'interplay'
]

export async function POST(req) {
  const { text, tone } = await req.json()
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ rewritten: 'Missing OpenAI API Key.' }, { status: 500 })
  }

  const prompt = `
You are a human editor. Rewrite the following text in a plain, natural, student-like tone (without sounding robotic or overly formal). Avoid buzzwords, vague phrases, and unnatural transitions. Preserve meaning. Do not include the following banned words: ${BANNED_WORDS.join(', ')}.

Text:
"""${text}"""
`

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
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await res.json()

    const output = data?.choices?.[0]?.message?.content?.trim()
    if (!output) {
      return NextResponse.json({ rewritten: 'No rewrite returned.' }, { status: 500 })
    }

    return NextResponse.json({ rewritten: output })
  } catch (err) {
    console.error('OpenAI API Error:', err)
    return NextResponse.json({ rewritten: 'Error contacting OpenAI.' }, { status: 500 })
  }
}
