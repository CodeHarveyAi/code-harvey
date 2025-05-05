// ✅ File: /app/api/rewrite/phaserunner.js
import { runPhase0 } from './phase0/phase0.js';
import { runPhase1 } from './phase1/phase1.js';
import { runPhase2 } from './phase2/phase2.js';
import { runPhase3 } from './phase3/phase3.js';
import { runPhase4 } from './phase4/phase4.js';
import { runPhase5 } from './phase5/phase5.js';
import { runPhase6 } from './phase6/phase6.js';
import { runPhase7 } from './phase7/phase7.js';

export async function runAllPhases(input, subject = 'general', detector = null) {
  let output = input;
  const logPhase = (phaseNum, label, result) => {
    console.log(`\n🌀 Phase ${phaseNum}: ${label}`);
    console.log(result);
  };

  try {
    output = await runPhase0(output);
    logPhase(0, 'Pre-clean', output);

    output = await runPhase1(output);
    logPhase(1, 'Grammar Fix', output);

    output = await runPhase2(output);
    logPhase(2, 'Student Tone', output);

    output = await runPhase3(output);
    logPhase(3, 'AI-Syntax Scrub', output);

    output = await runPhase4(output);
    logPhase(4, 'Transition Patch', output);

    output = await runPhase5(output);
    logPhase(5, 'Rhythm Fix', output);

    output = await runPhase6(output, { subject });
    logPhase(6, 'Ghostwriter Fusion', output);

    output = await runPhase7(output, detector, subject);
    logPhase(7, 'Final Cleanup', output);

    return output.trim();
  } catch (err) {
    console.error('[PhaseRunner ❌ Error]', err.message);
    return input;
  }
}
