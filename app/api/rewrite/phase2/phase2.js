// ✅ File: /app/api/rewrite/phase2/phase2.js (GPT-only version)
import { getHarveyPrompt } from '@/harveyprotocol.js';

export async function runPhase2(input) {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    console.warn('[Phase 2 - GPT] ❌ Invalid input');
    return '';
  }

  const prompt = getHarveyPrompt(2, input);


  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'ft:gpt-3.5-turbo-0125:personal:codeharvey-v1:BSeLCx1r',
        temperature: 0.4,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: input }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Phase 2 GPT error: ${errText}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content?.trim() || '';

    return content;
  } catch (err) {
    console.error('[Phase 2 - GPT] ❌ Error:', err.message);
    return '';
  }
}