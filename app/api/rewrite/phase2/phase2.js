import { getHarveyPrompt } from '@/harveyprotocol.js';
import { injectToneInstruction } from '@/lib/injecttonebytopic.js';
import { detectSubject } from '@/lib/detectsubject.js';

// Fixed Phase 2 - Remove the sentence-breaking cleanPatterns

export async function runPhase2(input, subject = 'general') {
  if (!input || typeof input !== 'string' || input.trim() === '') {
    console.warn('[Phase 2 - Claude] ❌ Invalid input');
    return input;
  }

  // Auto-detect subject if not passed
  const detectedSubject = subject || detectSubject(input);
  const toneInstruction = injectToneInstruction(detectedSubject);
  console.log('[Phase 2 - Claude] Tone routing for subject:', detectedSubject);

  // Get Harvey Phase 2 prompt logic (prepares rewrite format)
  const promptBase = getHarveyPrompt(2)(input);

  // Combine tone + task prompt, but lock wording
  const fullPrompt = `${toneInstruction}

Your task is to inject student-like tone into the paragraph below WITHOUT changing any vocabulary, structure, or phrasing. Do NOT replace words, simplify, reword, or summarize. Focus only on voice, rhythm, and tone. Leave all content and terms exactly as written.

${promptBase}`;

  console.log('[Phase 2 - Claude] Prompt built. Injecting via Claude 3.7 Sonnet...');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 800,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: fullPrompt
              }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude Phase 2 error: ${errText}`);
    }

    const json = await res.json();
    console.log('[Phase 2 - Claude] Full API response:', JSON.stringify(json, null, 2));

    const rawOutput = json?.content?.[0]?.text?.trim() ?? input;
    
    
    // 🎯 USE CLAUDE'S OUTPUT DIRECTLY
    const output = rawOutput;

    console.log('[Phase 2 ✅ Claude] Output:', output);
    return output;
  } catch (err) {
    console.error('[Phase 2 - Claude] ❌ Error:', err.message);
    return input;
  }
}