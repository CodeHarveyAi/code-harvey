// /app/api/rewrite/phase3/phase3.js
import { getHarveyPrompt } from '@/harveyprotocol.js';
import { breakPacingPatterns } from '@/lib/structuretools.js';
import { runGrammarCleanup } from '@/lib/grammarfix.js';

export async function runPhase3(input) {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    console.warn('[Phase 3] Invalid input.');
    return '';
  }

  const systemPrompt = getHarveyPrompt(3, input);

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
      temperature: 0.3
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Phase 3 GPT error: ${res.status}: ${errText}`);
  }

  const json = await res.json();
  let output = json.choices?.[0]?.message?.content?.trim() || '';

  if (!output) {
    throw new Error('Phase 3 returned empty output.');
  }



  // Post-processing after GPT
 
  output = await runGrammarCleanup(output); // ✅ strong full grammar cleanup

  output = breakPacingPatterns(output);     // ✅ then rhythm fix
 
  return output.trim();
}