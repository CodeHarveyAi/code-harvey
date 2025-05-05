// ✅ File: /app/api/rewrite/phase6/phase6.js
import { randomizeBySubject } from '@/lib/subjectcontrol.js';
import { injectAcademicImperfection } from '@/lib/injectacademicimperfection.js';

export async function runPhase6(input, body) {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    console.warn('[Phase 6] ❌ Invalid input');
    return '';
  }

  // Skip sentences with transition markers
  if (input.includes('[[TRANS:')) return input;

  try {
   

    const res = await fetch('http://localhost:8000/ghostwrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input, voice: 'jo_default' })
    });

    const json = await res.json();

    if (!json?.rewritten_text) {
      throw new Error('No text returned from Ghostwriter');
    }

    let output = json.rewritten_text.trim();
  

    // 🔁 Use subject type from body (default to "generic")
    const subjectType = (body?.subject || 'generic').toLowerCase();

    // Inject imperfections based on subject
    output = injectAcademicImperfection(subjectType, output);

    // Apply JoPattern for variation
    const joPatternRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'ft:gpt-3.5-turbo-0125:code-harvey:jopattern-v1:BTcEI2j7',
        messages: [
          { role: 'system', content: 'Apply one Jo rhythm pattern to humanize this paragraph. Make sure the meaning stays intact.' },
          { role: 'user', content: output }
        ],
        temperature: 0.3
      })
    });
    
    const joPatternJson = await joPatternRes.json();
    output = joPatternJson.choices?.[0]?.message?.content?.trim() || output;
    
    // Add subject-based variation layer
    output = randomizeBySubject(output, subjectType);

    return output;
  } catch (err) {
    console.error('[Phase 6 ❌ Error]', err.message);
    return input;
  }
}