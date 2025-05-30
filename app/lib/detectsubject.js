export function detectSubject(text) {
  if (!text || typeof text !== 'string') return 'general';

  const lowered = text.toLowerCase();

  const keywordMap = {
    healthcare: [
      'patient', 'hospital', 'clinical', 'nurse', 'treatment', 'medical', 'health', 'doctor',
      'medicine', 'healthcare', 'wellness', 'disease', 'therapy', 'rehabilitation',
       'surgery', 'physician', 'medication', 'symptoms', 'care', 'diagnosis',
       'healthcare provider', 'healthcare system', 'healthcare professional','illness', 'healthcare services', 'healthcare delivery', 'healthcare management',
       'healthcare policy', 'healthcare technology', 'healthcare research', 'healthcare quality',
    ],
    law: [
      'legal', 'contract', 'rights', 'court', 'justice', 'precedent', 'lawsuit', 'lawyer',
      'attorney', 'case', 'evidence', 'litigate', 'litigant', 'litigating', 'law',
      'litigation', 'jurisdiction', 'plaintiff', 'defendant', 'statute', 'regulation', 'compliance'
    ],
    business: [
      'revenue', 'profit', 'market', 'financial', 'leadership', 'manager', 'management',
      'strategy', 'strategic', 'budget', 'budgets', 'budgeting', 'cost', 'expenses',
      'organizational', 'corporate', 'investment', 'investments', 'economy', 'economic',
      'operations', 'efficiency', 'profitability', 'fiscal', 'analysis', 'stakeholders', 'forecast'
    ],
    humanities: [
      'identity', 'culture', 'philosophy', 'ethics', 'history', 'literature',
      'language', 'beliefs', 'values', 'art', 'aesthetics', 'narrative', 'perspective'
    ],
    science: [
      'experiment', 'biology', 'hypothesis', 'chemical', 'physics',
      'laboratory', 'observation', 'results', 'genetics', 'cells', 'scientific', 'research', 'variables',
      ' theory', 'methodology', 'scientific method', 
    ],
    politics: [
      'government', 'election', 'policy', 'democracy', 'republican', 'democrat', ' politics',
      'politician', 'vote', 'campaigning', 'political party', 'political science',
      'legislation', 'senate', 'campaign', 'voting', 'public office', 'congress', 'political', 'lobbying'
    ],
    war: [
      'terrorism', 'military', 'soldier', 'bomb', 'invasion', 'civilian',
      'casualties', 'combat', 'weapon', 'troops', 'marines', 'army',
    ],
    social_justice: [
      'equity', 'discrimination', 'racism', 'inequality', 'activism', 'oppression', 'equality',
      'justice', 'civil rights', 'privilege', 'marginalized', 'bias', 'diversity', 'inclusion'
    ],
    environment: [
      'climate', 'pollution', 'carbon', 'ecosystem', 'sustainability', 'biodiversity',
      'deforestation', 'greenhouse', 'global warming', 'renewable', 'environmental', 'conservation'
    ],
    education: [
      'learning', 'classroom', 'teacher', 'students', 'curriculum', 'education',
      'instruction', 'academic', 'schools', 'assessment', 'testing', 'pedagogy', 'literacy'
    ],
    technology: [
      'ai', 'software', 'data', 'machine learning', 'programming', 'javascript', 
      'algorithm', 'automation', 'tech', 'hardware', 'innovation', 'digital', 'robotics', 'systems', 'cybersecurity'
    ]
  };

  for (const [topic, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((kw) => lowered.includes(kw))) {
      console.log(`[🧠 AutoDetect] Matched topic: ${topic}`);
      return topic;
    }
  }

  console.warn('[🧠 AutoDetect] No topic matched. Defaulting to general.');
  return 'general';
}
