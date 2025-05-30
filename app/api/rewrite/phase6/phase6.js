// ✅ Phase 6 - Controlled Chaos Rewrite (JoPattern + Reflection)
import { getReflectionForEndingType } from '@/lib/reflectionbank.js';
import { rewriteControlledChaos } from '@/lib/openaiutils.js';

export async function runPhase6(input, metadata = {}) {
  console.log('[Phase 6] 🌀 Starting Controlled Chaos Rewrite...');

  if (!input || typeof input !== 'string') {
    console.warn('[Phase 6] ❌ Invalid input');
    return input;
  }

  const subject = metadata.subject || 'general';
  const selectedPattern = metadata.selectedPattern;
  const endingType = metadata.endingType;
  const reflection = metadata.reflection || getReflectionForEndingType(endingType);

  if (!selectedPattern || !reflection) {
    console.warn('[Phase 6] ❌ Missing pattern or reflection');
    return input;
  }

  console.log('[Phase 6] 🎯 Pattern:', selectedPattern.id);
  console.log('[Phase 6] 💬 Reflection:', reflection);

  const chaosPrompt = `You are a human academic writer. Rewrite the following paragraph using the given sentence structure. Your rewrite must sound natural, intelligent, and grounded — like a real student organizing their thoughts.

Guidelines:
- Integrate the provided reflection somewhere in the paragraph
- Follow the provided sentence structure pattern
- Avoid first-person voice, em dashes, robotic logic, or AI-style phrasing
- Keep the original meaning intact

Structure Pattern: ${selectedPattern.structure}
Reflection Phrase: ${reflection}

Original:
"""
${input}
"""`;

  try {
    const output = await rewriteControlledChaos({
      model: 'gpt-4o',
      temperature: 0.5,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: chaosPrompt
        }
      ]
    });

    console.log('[Phase 6] ✅ Final Output Ready');
    return output.trim();

  } catch (err) {
    console.error('[Phase 6] ❌ Rewrite failed:', err);
    return input;
  }
}
