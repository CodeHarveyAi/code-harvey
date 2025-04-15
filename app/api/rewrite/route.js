import { NextResponse } from 'next/server'

export async function POST(req) {
  const { text, tone } = await req.json()

  const endpoint = tone === 'academic'
    ? '/api/rewrite/claude'
    : '/api/rewrite/openai'

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, tone }),
  })

  const json = await res.json()
  return NextResponse.json(json)
}
