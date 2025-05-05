// ✅ File: /app/harveyprotocol.js (GPT-only, streamlined version)

export function getHarveyPrompt(phase) {
  switch (phase) {
    case 0:
      return `
- Clean the paragraph by removing AI buzzwords and overly formal transitions.
- Preserve all original meaning — do not summarize, reorder, or expand.
- Vary verbs and nouns for natural rhythm.
- Avoid repeating descriptive words unless necessary for clarity.
- Keep protected academic terms intact.
- Avoid sentence fragments, run-ons, and robotic phrasing.
- Rewrite any sentence that sounds like it was trained on AI writing prompts or SEO language.
- Output must remain readable and realistic.
      `.trim();

    case 1:
      return `
Phase 1: Grammar and Tone Fix Only

- DO NOT reword or restructure anything.
- DO NOT add transitions or alter pacing.
- Your only job:
  • Fix grammar, punctuation, and awkward phrasing.
  • Resolve splices or broken logic.
  • Improve clarity — without changing content.
      `.trim();

      case 2:
  return `
Rewrite this paragraph in a natural academic tone like a smart college student. 
Your goal is to fix flow and phrasing so it reads like a human student, not AI.

RULES:
- Third person only. Do not use "you", "we", "our", or "I".
- Sentence length must vary (some short, some longer).
- Break any perfect rhythm or symmetry.
- Replace all em dashes with commas, parentheses, or semicolons.
- DO NOT use phrases like “the importance of”, “navigate”, “diverse mix”, “key role”.
- NO idioms, metaphors, or casual slang (“a tough gig”, “you know”, “stuff”).
- NO over-polished transitions like “therefore”, “furthermore”, or “in order to”.
- Keep all original ideas. Do not add, remove, summarize, or reorder.
- DO NOT use poetic or abstract language (keep it grounded and direct).
- Avoid mirrored logic sentence structures.

The output must sound like a real student writing under pressure but still academic. Do not explain or comment — only return the rewritten paragraph.
`.trim();

      
    case 3:
      return `
Audit the paragraph to remove AI detection triggers:
- Do NOT add or summarize.
- Avoid poetic or metaphorical phrasing.
- No symmetry, buzzwords, or over-polished flow.
- Rewrite repeated sentence structures or phrasing so they sound naturally varied.
- Rewrite only what sounds artificial.
- Maintain sentence count and idea order.
- Prioritize human rhythm, tone, and pacing.
- Output only the final paragraph.
      `.trim();

    case 4:
      return `
Rewrite to sound like a real student writing under deadline:
- Break perfect pacing with some short and long sentences.
- Avoid robotic symmetry or polished transitions.
- Use plain academic terms — no fancy synonyms.
- Do NOT add, summarize, or shift ideas.
- Keep all meaning intact — just make it sound human.
      `.trim();

    case 5:
      return `
Smooth the paragraph without sounding AI-generated:
- Keep a grounded academic tone.
- No rewording into polished or abstract forms.
- DO remove redundancy and robotic phrasing.
- Keep ideas and order identical.
- Maintain imperfections in rhythm or style.
- Avoid using the same content word more than once unnecessarily.
- Reshape sentences for mixed rhythm. Rewrite anything that sounds metronomic or too evenly paced.
- Do not delete ideas — rewrite with altered cadence and flow.
      `.trim();

 case 6:
   return `
  Rewrite the paragraph like it was written by a college student under deadline. 
  It should sound real — slightly imperfect — but still academically appropriate.
      
  RULES:
    - Third person only. Do not use first-person or second-person pronouns.
    - Sentence rhythm should feel human (uneven, mixed lengths, a little rushed).
    - Break up overly clean structure. No perfect transitions or mirrored phrasing.
    - Do NOT use em dashes. Use commas, parentheses, or semicolons instead.
    - NO AI-style phrases like “navigate,” “diverse perspectives,” “key role,” “insightful”.
    - DO NOT use idioms, metaphors, slang, or figures of speech (“get a grip”, “a lot”, “kind of mess”).
    - Use plain academic vocabulary. Avoid poetic or overly formal language.
    - Preserve meaning. Don’t summarize, reorder, or add anything new.
    - Sound like a student writing quickly but carefully.
    - Randomly vary sentence openings (e.g., not every sentence should begin with a subject).
    - Insert one or two slight redundancies or repetitions — humans often do this unconsciously.
    - Insert one “off-balance” sentence (longer or shorter than the rest) with unusual structure — think like a tired student.
    - Avoid any sentence-to-sentence mirroring (structure, logic, or vocabulary).
    - Reuse 1–2 key content words to simulate imperfect editing — real students double up.
    - Match subject type: inject common phrase structures from that field.

    Return only the rewritten paragraph. No notes or explanations.
      `.trim();
      

    case 7:
      return `
Final cleanup pass — humanize tone and fix lingering AI tells:
- Remove em dashes and replace with commas, parentheses, or semicolons.
- Fix comma splices, punctuation gaps, and repeated words.
- Ensure paragraph has no mirrored syntax or summary closers.
- Maintain original meaning, length, and structure.
- Output must read like a real college student wrote it — no polish, no bots.
      `.trim();

    default:
      return 'No prompt found for this phase.';
  }
}
