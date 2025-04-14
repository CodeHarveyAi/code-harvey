// app/api/rewrite/route.js
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { text } = await req.json()

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Rewrite this academic text in a human tone without changing meaning:' },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
      }),
    })

    const data = await res.json()

    const rewritten = data.choices?.[0]?.message?.content || 'Rewrite failed.'
    return NextResponse.json({ rewritten })
  } catch (err) {
    console.error('Rewrite error:', err)
    return NextResponse.json({ rewritten: 'Error occurred while rewriting.' })
  }
}
