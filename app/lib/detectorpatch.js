export function refineForDetector(output, target = 'gptzero') {
  if (!output || typeof output !== 'string') return output;

  let refined = output;

  // --- GPTZero: Academic structure disrupt ---
  if (target === 'gptzero') {
    // Break clean lists into multiple simpler lines
    refined = refined.replace(
      /Work with diverse teams, care for emotionally vulnerable patients, and make ethical decisions\./i,
      'That means working with different teams. It also involves caring for emotionally vulnerable patients. Making ethical decisions is part of it, too.'
    );

    // Break polished closer
    refined = refined.replace(
      /These qualities directly influence both organizational performance and patient results\./i,
      'These qualities influence how the organization works — and they can also affect patient outcomes in different ways.'
    );

    // Soften GPT phrasing
    refined = refined.replace(
      /Emotional intelligence establishes the foundation for interpersonal relationships/i,
      'Emotional intelligence plays a big role in forming interpersonal relationships'
    );
  }

  // --- ZeroGPT: Entropy balancer ---
  if (target === 'zerogpt') {
    // Add starter disruption
    refined = refined.replace(
      /\. Emotional intelligence/i,
      '. Now, emotional intelligence'
    );

    // Slight restatement for rhythm entropy
    refined = refined.replace(
      /leaders skilled at understanding emotions can guide with compassion, communicate effectively, and maintain their professional integrity/i,
      'Leaders who understand emotions are often better at guiding with compassion. They also communicate more clearly and keep their professionalism.'
    );
  }

  return refined.trim();
}

export const detectorPatchesByField = {
  general: [
    { match: /\bkey (factor|role)\b/gi, replace: 'important part' },
    { match: /\bplays a (key|critical) role\b/gi, replace: 'significantly affects' },
    { match: /\bdiverse (perspectives|backgrounds|populations)\b/gi, replace: 'people from different situations' },
    { match: /\btherefore\b/gi, replace: 'as a result' },
    { match: /\bfurthermore\b/gi, replace: 'also' },
    { match: /\bthus\b/gi, replace: 'so' }
  ],

  healthcare: [
    { match: /\bemotional intelligence (is key|plays a key role)\b/gi, replace: 'helps leaders relate to others' },
    { match: /\bpatient-centered care\b/gi, replace: 'care that prioritizes individual needs' },
    { match: /\bclinical decision-making\b/gi, replace: 'medical judgment' },
    { match: /\bhigh-stress environments\b/gi, replace: 'stressful clinical settings' },
    { match: /\binterdisciplinary teams\b/gi, replace: 'teams from different specialties' }
  ],

  nursing: [
    { match: /\bholistic care\b/gi, replace: 'treating the whole patient' },
    { match: /\bnursing interventions\b/gi, replace: 'steps nurses take to help' },
    { match: /\bevidence-based practice\b/gi, replace: 'using research to guide care' }
  ],

  business: [
    { match: /\bentrepreneurial mindset\b/gi, replace: 'approach to opportunity and innovation' },
    { match: /\bvalue proposition\b/gi, replace: 'main reason customers choose something' },
    { match: /\bstrategic alignment\b/gi, replace: 'matching goals across departments' },
    { match: /\bleverages data\b/gi, replace: 'uses data to make choices' }
  ],

  marketing: [
    { match: /\bconsumer engagement\b/gi, replace: 'how customers respond' },
    { match: /\bbrand loyalty\b/gi, replace: 'repeat customer behavior' },
    { match: /\bcustomer-centric\b/gi, replace: 'focused on the buyer' },
    { match: /\btarget demographics\b/gi, replace: 'intended customer group' }
  ],

  law: [
    { match: /\blegal precedent\b/gi, replace: 'prior court decision' },
    { match: /\bjurisprudence\b/gi, replace: 'legal theory' },
    { match: /\bstatutory interpretation\b/gi, replace: 'reading and applying laws' },
    { match: /\brule of law\b/gi, replace: 'fair legal principles' }
  ],

  criminalJustice: [
    { match: /\brecidivism\b/gi, replace: 'returning to criminal behavior' },
    { match: /\bcorrectional system\b/gi, replace: 'prison and rehabilitation programs' },
    { match: /\bdeterrence\b/gi, replace: 'preventing crime by threat of punishment' }
  ],

  education: [
    { match: /\bdifferentiated instruction\b/gi, replace: 'teaching adapted to students' },
    { match: /\b21st-century skills\b/gi, replace: 'modern problem-solving and thinking' },
    { match: /\bscaffolding learning\b/gi, replace: 'building knowledge step by step' }
  ],

  psychology: [
    { match: /\bcognitive dissonance\b/gi, replace: 'mental discomfort from conflicting beliefs' },
    { match: /\bsocial conditioning\b/gi, replace: 'learned behavior from the environment' },
    { match: /\bbehavioral interventions\b/gi, replace: 'techniques to change behavior' }
  ],

  sociology: [
    { match: /\bsocial constructs\b/gi, replace: 'ideas created by society' },
    { match: /\bsocial stratification\b/gi, replace: 'ranking people into levels' },
    { match: /\bintersectionality\b/gi, replace: 'overlapping identity struggles' }
  ],

  theology: [
    { match: /\bdivine intervention\b/gi, replace: 'spiritual influence' },
    { match: /\bmoral framework\b/gi, replace: 'set of religious values' },
    { match: /\bfaith-based reasoning\b/gi, replace: 'thinking rooted in belief' }
  ],

  computerScience: [
    { match: /\bmachine learning models\b/gi, replace: 'programs that learn from data' },
    { match: /\bscalable systems\b/gi, replace: 'systems that work at bigger sizes' },
    { match: /\balgorithmic efficiency\b/gi, replace: 'speed and performance of code' }
  ],

  biology: [
    { match: /\bcellular respiration\b/gi, replace: 'how cells produce energy' },
    { match: /\bphotosynthesis\b/gi, replace: 'plants making energy from light' },
    { match: /\bgenetic mutation\b/gi, replace: 'change in DNA' }
  ],

  chemistry: [
    { match: /\bmolecular bonding\b/gi, replace: 'how atoms stick together' },
    { match: /\bchemical equilibrium\b/gi, replace: 'balance between reactions' },
    { match: /\bstoichiometry\b/gi, replace: 'calculation of reactants and products' }
  ],

  physics: [
    { match: /\bquantum mechanics\b/gi, replace: 'rules of tiny particles' },
    { match: /\bnewtonian physics\b/gi, replace: 'laws of motion and gravity' },
    { match: /\bgravitational force\b/gi, replace: 'pull between masses' }
  ]
};

export function zeroGPTPatcher(text, subject = 'general') {
  const patches = [
    ...(detectorPatchesByField.general || []),
    ...(detectorPatchesByField[subject] || [])
  ];

  for (const { match, replace } of patches) {
    text = text.replace(match, replace);
  }

  return text;
}