// ✅ File: /app/api/rewrite/phase7/phase7.js
// Role: Final cleanup + AI detection disruption + optional detector refinement

import { transformAll } from '@/lib/transformpipeline.js';
import { runLanguageToolGrammarCheck } from '@/lib/languagetool.js';
import { fixCommaSplicesAndClosers } from '@/lib/fixgptclosers.js';
import { refineForDetector, zeroGPTPatcher } from '@/lib/detectorpatch.js';
import { applyHumanImperfections } from '@/lib/humanimperfection.js';
import { breakPacingPatterns, removeMirroredPhrases } from '@/lib/structuretools.js';


// Skip sentences with transition markers
    export async function runPhase7(text, detectorTarget = null, field = 'general') {
      try {
        if (!text || typeof text !== 'string' || text.trim() === '') {
          console.warn('[Phase 7] ❌ Invalid input');
          return '';
        }
    
        // Skip sentences with transition markers
        if (text.includes('[[TRANS:')) return text;
    
      
        let output = text;
    
        output = breakPacingPatterns(output);
       
    
        output = removeMirroredPhrases(output);
      
    
        output = fixCommaSplicesAndClosers(output);
       
        // 🔁 Rewrite pass BEFORE grammar corrections or ghostwriter add-ins
        output = await transformAll(output, 'phase7', field);
        
    
        // ✅ Then grammar fix
        output = await runLanguageToolGrammarCheck(output);
        
        // ✅ Then slight noise
        output = applyHumanImperfections(output);
       
    

    // Final detector-specific tweaks
    if (detectorTarget) {
      output = detectorTarget === 'zerogpt'
        ? zeroGPTPatcher(output, field)
        : refineForDetector(output, detectorTarget);
    }

   
    return output.trim();

  } catch (err) {
    console.error('[Phase 7] ❌ Final Cleanup Error:', err.message);
    return String(text || '');
  }
}