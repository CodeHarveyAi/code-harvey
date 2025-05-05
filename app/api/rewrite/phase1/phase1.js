// /app/api/rewrite/phase1/phase1.js
import { getHarveyPrompt } from '@/harveyprotocol.js';

export async function runPhase1(input) {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    console.warn('[Phase 1] Invalid input.');
    return '';
  }

  const systemPrompt = getHarveyPrompt(1, input);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Phase 1 OpenAI error: ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const output = json.choices?.[0]?.message?.content?.trim() || '';

  if (!output) {
    throw new Error('Phase 1 returned empty output.');
  }

  return output;
}
