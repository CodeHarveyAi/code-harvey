// ✅ File: /app/api/rewrite/phase0/phase0.js

import { transformAll } from '@/lib/transformpipeline.js';
import { runGrammarCleanup } from '@/lib/grammarfix.js';
import { getHarveyPrompt } from '@/harveyprotocol.js';


export async function runPhase0(text) {
  try {
    let output = text;

    const joPatternResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'ft:gpt-3.5-turbo-0125:code-harvey:jopattern-v1:BTcEI2j7',
        messages: [
          { role: 'system', content: 'Rewrite this text using one of Jo’s human rhythm patterns. Make it sound natural and student-written without changing the meaning. Only apply one rhythm shift per run.' },
          { role: 'user', content: output }
        ],
        temperature: 0.3
      })
    });
    
    const joPatternJson = await joPatternResponse.json();
    output = joPatternJson.choices?.[0]?.message?.content?.trim() || output;
    
    // ✅ Apply Harvey Prompt via OpenAI
    const systemPrompt = getHarveyPrompt(0, output);
  

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: output }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[Phase 0] OpenAI Error: ${response.status} - ${error}`);
    }

    const json = await response.json();
    output = json.choices?.[0]?.message?.content?.trim() || '';


    // ✅ Unified cleanup pass
    output = await transformAll(output);

    // ✅ Final formatting
    output = runGrammarCleanup(output);

    return output.trim();
  } catch (err) {
    console.error('[Phase 0] ❌ Processing error:', err.message);
    return String(text || '');
  }
}