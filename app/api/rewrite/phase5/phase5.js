// /app/api/rewrite/phase5/phase5.js
import { runHumanizerPass  } from '@/lib/middleware.js'; // Import the necessary functions

/**
 * Phase 5: Rhythm & Pacing Control
 * Break perfect AI rhythm without over-polishing.
 */
export async function runPhase5(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('[Phase 5] ❌ Invalid input:', text);
    return '';
  }

  // Skip sentences with transition markers
  if (text.includes('[[TRANS:')) return text;

  try {
    let output = text;

    output = runHumanizerPass(output); // Split robotic long chains

    return output.trim();
  } catch (err) {
    console.error('[Phase 5] ❌ Processing Error:', err.message);
    return String(text || '');
  }
}