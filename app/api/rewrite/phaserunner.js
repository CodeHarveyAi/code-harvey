// ✅ File: /app/api/rewrite/phaserunner.js

import { runPhase0 }  from './phase0/phase0.js';
import { runPhase1 }  from './phase1/phase1.js';
import { runPhase2 }  from './phase2/phase2.js';
import { runPhase3 }  from './phase3/phase3.js';
import { runPhase4 }  from './phase4/phase4.js';
import { runPhase5 }  from './phase5/phase5.js';
import { runPhase6 }  from './phase6/phase6.js';
import { runPhase6_5 } from './phase6_5/phase6_5.js';
import { runPhase7 }  from './phase7/phase7.js';

const phaseMap = [
  { fn: runPhase0, label: 'Pre-clean' },
  { fn: runPhase1, label: 'Grammar Fix' },
  { fn: runPhase2, label: 'Student Tone' },
  { fn: runPhase3, label: 'Repetition' },
  { fn: runPhase4, label: 'Transitions' },
  { fn: runPhase5, label: 'Rhythm' },
  { fn: runPhase6, label: 'SFT (Structure)' },
  { fn: runPhase6_5, label: 'SoulRewrite Detox' },
  { fn: runPhase7, label: 'Final Cleanup' }
];


// In your runAllPhases function, update the Phase 5 case:

export async function runAllPhases(input, options = {}) {
  const {
    subject = 'general',
    detector = null,
    from = 0,
    to = phaseMap.length - 1,
    verbose = true
  } = options;

  let output = input;
  let metadata = { subject }; // Initialize metadata with subject

  try {
    for (let i = from; i <= to; i++) {
      const { fn: phaseFn, label } = phaseMap[i];
      if (!phaseFn) continue;

      if (verbose) console.log(`\n🔷 Phase ${i}: ${label}`);

      let result;
      switch (i) {
        case 0:
          // runPhase0 returns { output, metadata, analysis }
          result = await phaseFn(output);
          output = typeof result === 'object' && result.output != null
            ? result.output
            : result;
          // Preserve any metadata from Phase 0
          if (typeof result === 'object' && result.metadata) {
            metadata = { ...metadata, ...result.metadata };
          }
          break;

        case 1:
          // runPhase1 expects string, returns object with { output, metadata }
          result = await phaseFn(output, subject, metadata);
          output = typeof result === 'object' && result.output != null
            ? result.output
            : result;
          break;

        case 2:
          // runPhase2 - tone detection, pass subject to metadata
          result = await phaseFn(output, subject);
          output = result;
          // Store detected subject in metadata for later phases
          metadata.subject = subject;
          break;

        case 5:
          // *** UPDATED *** Phase 5 now returns { output, metadata }
          result = await phaseFn(output, metadata);
          output = result.output;
          metadata = { ...metadata, ...result.metadata }; // Merge metadata
          break;

        case 6:
          // Phase 6 uses metadata from Phase 5 (including selectedPattern)
          result = await phaseFn(output, metadata);
          output = result;
          break;

        case 7:
          // Phase 7 returns { output, flags }
          result = await phaseFn(output, detector, subject);
          output = (typeof result === 'object' && result.output != null)
            ? result.output
            : result;
          break;

        default:
          // phases 3, 4, 6.5 all return string
          result = await phaseFn(output, subject);
          output = result;
      }

      if (verbose) {
        console.log(`✅ Phase ${i} complete; output is ${typeof output}`);
        if (i === 5 && metadata.selectedPattern) {
          console.log(`📋 Pattern selected: ${metadata.selectedPattern.id}`);
        }
      }
    }

    return typeof output === 'string'
      ? output.trim()
      : '';
  } catch (err) {
    console.error('[PhaseRunner ❌ Error]', err.message);
    return input;
  }
}