// File: app/api/rewrite/route.js

import { NextResponse } from 'next/server';
import { runPhase0 } from './phase0/phase0.js';
import { runPhase1 } from './phase1/phase1.js';
import { runPhase2 } from './phase2/phase2.js';
import { runPhase3 } from './phase3/phase3.js';
import { runPhase4 } from './phase4/phase4.js';
import { runPhase5 } from './phase5/phase5.js';
import { runPhase6 } from './phase6/phase6.js';
import { runPhase6_5 } from './phase6_5/phase6_5.js';
import { runPhase7 } from './phase7/phase7.js';

export async function POST(request) {
  console.log('🔵 /api/rewrite endpoint hit');

  try {
    const { text, phase, returnAnalysis } = await request.json();
    console.log(`📝 Received text (length: ${text?.length || 0}), phase: ${phase}`);

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid text input' }, { status: 400 });
    }

    if (!phase) {
      return NextResponse.json({ error: 'Phase is required' }, { status: 400 });
    }

    // Run all phases sequentially
    if (phase === 'all') {
      console.log('🔄 Running all phases sequentially...');

      let currentText = text;
      let allMetadata = {};
      let allAnalysis = [];
      let phaseOutputs = [];

      const allPhases = ['0', '1', '2', '3', '4', '5', '6', '6_5', '7'];
      for (const phaseLabel of allPhases) {
        console.log(`\n🔷 Running Phase ${phaseLabel}...`);

        try {
          let result;
          switch (phaseLabel) {
            case '0': result = await runPhase0(currentText); break;
            case '1': result = await runPhase1(currentText); break;
            case '2': result = await runPhase2(currentText); break;
            case '3': result = await runPhase3(currentText); break;
            case '4': result = await runPhase4(currentText); break;
            case '5': result = await runPhase5(currentText); break;
            case '6': result = await runPhase6(currentText); break;
            case '6_5': result = await runPhase6_5(currentText); break;
            case '7': result = await runPhase7(currentText); break;
          }

          if (typeof result === 'object' && result.output) {
            currentText = result.output;
            allMetadata[`phase${phaseLabel}`] = result.metadata || {};
            if (result.analysis) {
              allAnalysis.push({
                phase: phaseLabel,
                analysis: result.analysis
              });
            }
          } else {
            currentText = result;
          }

          phaseOutputs.push({
            phase: phaseLabel,
            output: currentText
          });

          console.log(`✅ Phase ${phaseLabel} complete`);
        } catch (phaseError) {
          console.error(`❌ Phase ${phaseLabel} failed:`, phaseError);
        }
      }

      return NextResponse.json({
        output: currentText,
        metadata: allMetadata,
        analysis: returnAnalysis ? allAnalysis : undefined,
        phaseOutputs: phaseOutputs,
        phase: 'all'
      });
    }

    // Single phase execution
    console.log(`🔷 Phase ${phase}: Starting`);

    let result;
    switch (phase) {
      case '0': result = await runPhase0(text); break;
      case '1': result = await runPhase1(text); break;
      case '2': result = await runPhase2(text); break;
      case '3': result = await runPhase3(text); break;
      case '4': result = await runPhase4(text); break;
      case '5': result = await runPhase5(text); break;
      case '6': result = await runPhase6(text); break;
      case '6_5': result = await runPhase6_5(text); break;
      case '7': result = await runPhase7(text); break;
      default:
        return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
    }

    if (typeof result === 'object' && result.output) {
      return NextResponse.json({
        output: result.output,
        metadata: result.metadata,
        analysis: returnAnalysis ? result.analysis : undefined,
        phase
      });
    } else {
      return NextResponse.json({ output: result, phase });
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
