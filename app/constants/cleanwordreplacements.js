// File: app/constants/cleanWordReplacements.js
// Clean, deduplicated word replacements from JSONL + existing rules.js

export const cleanWordReplacements = {
    // Core AI words (high priority)
    'utilize': 'use',
    'facilitate': 'help',
    'implement': 'do',
    'demonstrate': 'show',
    'establish': 'set up',
    'optimize': 'improve',
    'enhance': 'make better',
    'leverage': 'use',
    'comprehensive': 'complete',
    'subsequently': 'then',
    'nevertheless': 'but',
    'furthermore': 'also',
    'therefore': 'so',
    'consequently': 'as a result',
    'methodology': 'method',
    'paradigm': 'model',
  
    // Academic formal words
    'scrutinize': 'examine',
    'ascertain': 'find out',
    'elucidate': 'explain',
    'substantiate': 'prove',
    'corroborate': 'confirm',
    'juxtapose': 'compare',
    'amalgamate': 'combine',
    'synthesize': 'bring together',
  
    // Overly complex words
    'conceptualize': 'think of',
    'articulate': 'say',
    'enumerate': 'list',
    'delineate': 'outline',
    'characterize': 'describe',
    'exemplify': 'show',
    'manifest': 'show',
    'embody': 'represent',
    'encompass': 'include',
    'constitute': 'make up',
    'comprise': 'include',
  
    // Action verbs
    'culminate': 'end in',
    'initiate': 'start',
    'terminate': 'end',
    'commence': 'begin',
    'endeavor': 'try',
    'strive': 'try hard',
    'thrive': 'do well',
    'flourish': 'grow',
    'perpetuate': 'continue',
    'mitigate': 'reduce',
    'exacerbate': 'worsen',
    'ameliorate': 'improve',
    'augment': 'increase',
    'diminish': 'reduce',
    'proliferate': 'multiply',
    'disseminate': 'spread',
    'promulgate': 'announce',
    'expound': 'explain',
    'elaborate': 'expand on',
  
    // Thinking verbs
    'contemplate': 'think about',
    'deliberate': 'think over',
    'ponder': 'think about',
    'ruminate': 'think deeply',
    'speculate': 'guess',
    'hypothesize': 'suggest',
    'postulate': 'assume',
    'presuppose': 'assume',
    'surmise': 'guess',
    'conjecture': 'guess',
  
    // Perception verbs
    'discern': 'see',
    'perceive': 'notice',
    'apprehend': 'understand',
    'comprehend': 'understand',
    'illuminate': 'light up',
    'clarify': 'make clear',
    'interpret': 'explain',
  
    // Analysis verbs
    'analyze': 'break down',
    'evaluate': 'judge',
    'assess': 'judge',
    'appraise': 'value',
    'investigate': 'look into',
    'explore': 'look at',
    'examine': 'look at',
    'inspect': 'check',
    'survey': 'look over',
    'observe': 'watch',
    'monitor': 'watch',
  
    // Management verbs
    'supervise': 'oversee',
    'administer': 'manage',
    'coordinate': 'organize',
    'orchestrate': 'organize',
    'streamline': 'simplify',
    'rationalize': 'make sense of',
    'systematize': 'organize',
    'categorize': 'group',
    'classify': 'group',
    'prioritize': 'rank',
  
    // Emphasis verbs
    'emphasize': 'stress',
    'accentuate': 'highlight',
    'underscore': 'emphasize',
    'highlight': 'point out',
  
    // Validation verbs
    'validate': 'confirm',
    'verify': 'check',
    'authenticate': 'prove real',
    'vindicate': 'clear',
    'exonerate': 'clear',
    'absolve': 'forgive',
    'acquit': 'clear',
    'exculpate': 'excuse',
  
    // Modification verbs
    'alleviate': 'ease',
    'assuage': 'calm',
    'palliate': 'ease',
    'attenuate': 'weaken',
    'minimize': 'make smaller',
    'maximize': 'increase',
    'amplify': 'make louder',
    'intensify': 'strengthen',
    'magnify': 'make bigger',
    'escalate': 'increase',
  
    // Distribution verbs
    'propagate': 'spread',
    'circulate': 'spread',
    'distribute': 'give out',
    'allocate': 'give out',
    'designate': 'name',
    'nominate': 'name',
    'appoint': 'choose',
    'select': 'pick',
    'determine': 'decide',
    'resolve': 'solve',
    'conclude': 'end',
    'finalize': 'finish',
    'accomplish': 'do',
    'achieve': 'reach',
    'attain': 'get',
    'acquire': 'get',
    'obtain': 'get',
    'procure': 'get',
    'secure': 'get',
  
    // Maintenance verbs
    'retain': 'keep',
    'maintain': 'keep',
    'preserve': 'save',
    'conserve': 'save',
    'sustain': 'keep going',
    'prolong': 'extend',
    'extend': 'stretch',
    'expand': 'grow',
    'supplement': 'add to',
    'complement': 'complete',
    'integrate': 'combine',
    'incorporate': 'include',
    'assimilate': 'absorb',
    'accommodate': 'fit',
  
    // Change verbs
    'adapt': 'adjust',
    'modify': 'change',
    'alter': 'change',
    'transform': 'change',
    'convert': 'change',
    'transition': 'change',
    'evolve': 'develop',
    'progress': 'move forward',
    'advance': 'move forward',
    'proceed': 'go on',
    'continue': 'keep going',
    'persist': 'keep trying',
    'persevere': 'keep trying',
    'endure': 'last',
    'withstand': 'resist',
    'tolerate': 'put up with',
  
    // Speed verbs
    'expedite': 'speed up',
    'accelerate': 'speed up',
    'hasten': 'hurry',
    'precipitate': 'cause',
    'instigate': 'start',
    'provoke': 'cause',
    'stimulate': 'encourage',
    'motivate': 'encourage',
    'inspire': 'encourage',
    'galvanize': 'energize',
    'invigorate': 'energize',
    'revitalize': 'refresh',
    'rejuvenate': 'refresh',
    'regenerate': 'renew',
  
    // Repair verbs
    'restore': 'fix',
    'rehabilitate': 'fix',
    'rectify': 'fix',
    'remedy': 'fix',
    'refine': 'improve',
    'perfect': 'improve',
    'cultivate': 'grow',
    'nurture': 'care for',
    'foster': 'encourage',
    'promote': 'support',
    'advocate': 'support',
    'champion': 'support',
    'endorse': 'support',
    'sanction': 'approve',
  
    // Permission verbs
    'authorize': 'allow',
    'permit': 'allow',
    'enable': 'allow',
    'empower': 'give power to',
    'capacitate': 'make able',
    'equip': 'give tools to',
    'furnish': 'provide',
    'supply': 'give',
    'provision': 'provide',
    'bestow': 'give',
    'confer': 'give',
    'grant': 'give',
    'accord': 'give',
    'afford': 'give',
    'render': 'make',
  
    // Representation verbs
    'represent': 'stand for',
    'symbolize': 'stand for',
    'signify': 'mean',
    'denote': 'mean',
    'indicate': 'show',
    'suggest': 'hint',
    'imply': 'hint',
    'infer': 'conclude',
    'deduce': 'figure out',
    'derive': 'get from',
    'extract': 'take out',
    'elicit': 'bring out',
    'evoke': 'bring out',
    'invoke': 'call up',
    'summon': 'call',
  
    // Request verbs
    'solicit': 'ask for',
    'request': 'ask for',
    'petition': 'ask for',
    'appeal': 'ask for help',
    'plead': 'beg',
    'beseech': 'beg',
    'implore': 'beg',
    'entreat': 'beg',
  
    // Common phrases from your existing rules
    'this highlights': 'this shows',
    'in today\'s world': 'now',
    'proficiencies': 'capabilities',
    'outcomes': 'results',
    'health outcomes': 'health results',
    'patient outcomes': 'patient results',
    'crucial': 'important',
    'pivotal': 'central',
    'robust': 'strong',
    'robustly': 'strongly',
    'robustness': 'strength',
    'dynamic': 'changing',
    'aim': 'goal',
    'adept': 'experts',
    'array': 'range',
    'arrays': 'ranges',
    'nuanced': 'detailed',
    'nuance': 'detail',
    'nuances': 'details',
    'profound': 'notable',
    'significant': 'meaningful',
    'invaluable': 'helpful',
    'insightful': 'clear',
    'impactful': 'influential',
    'groundbreaking': 'new',
    'interplay': 'connection',
    'interactions': 'connections',
    'realm': 'area',
    'realm of': 'area of',
    'realm of study': 'area of study',
    'realm of research': 'area of research',
    'landscape': 'setting',
    'landscapes': 'settings',
    'landscapes of': 'settings of',
    'journey': 'process',
    'framework': 'structure',
    'frameworks': 'systems',
    'holistic': 'healthy',
    'growth': 'self-improvement',
    'diverse': 'varied',
    'synergy': 'collaboration',
    'engagement': 'participation',
    'optimization': 'improvement',
    'kindling': 'encouraging',
    'esteemed': 'valued',
    'intricate': 'complex',
    'intricacies': 'details',
    'imperative': 'central',
    'comprehensively': 'thoroughly',
    'integral': 'urgent',
    'integration': 'combination',
    'catalyst': 'spark',
    'catalysts': 'sparks',
    'multifaceted': 'complex',
    'multifacetedness': 'complexity',
    'multi-faceted': 'complex',
    'outcome-driven': 'goal-focused',
    'outcome-oriented': 'goal-focused',
    'outcome-based': 'goal-focused',
    'outcome': 'result',
    'cutting-edge': 'advanced',
    'measure': 'assess',
    'measures': 'assessments',
    'commonplace': 'common',
    'commonplaces': 'norms',
    'commonplace in': 'common in',
    'essential': 'necessary',
    'essentially': 'basically',
    'essentials': 'basics',
    'possessions': 'things',
    'bark': 'give',
    'key': 'central',
    'hone': 'learn',
    'hones': 'learns',
    'hurdle': 'problem',
    'hurdles': 'problems',
    'innovation': 'invention',
    'innovations': 'inventions',
    'innovator': 'inventor',
    'innovators': 'inventors',
    'vital': 'needed'
  };
  
  // Verb conjugation patterns (handles all tenses)
  export const verbPatterns = {
    patterns: [
      {
        pattern: /\btransform(?:s|ed|ing|ative|ation)?\b/gi,
        replacements: {
          'transform': 'change',
          'transforms': 'changes',
          'transformed': 'changed',
          'transforming': 'changing',
          'transformative': 'life-changing',
          'transformation': 'change'
        }
      },
      {
        pattern: /\bfoster(?:s|ed|ing)?\b/gi,
        replacements: {
          'foster': 'support',
          'fosters': 'supports',
          'fostered': 'supported',
          'fostering': 'supporting'
        }
      },
      {
        pattern: /\benhanc(?:e|es|ed|ing|ement)?\b/gi,
        replacements: {
          'enhance': 'improve',
          'enhances': 'improves',
          'enhanced': 'improved',
          'enhancing': 'improving',
          'enhancement': 'improvement'
        }
      },
      {
        pattern: /\bfacilitat(?:e|es|ed|ing|or|ion)?\b/gi,
        replacements: {
          'facilitate': 'help',
          'facilitates': 'helps',
          'facilitated': 'helped',
          'facilitating': 'helping',
          'facilitator': 'helper',
          'facilitation': 'help'
        }
      },
      {
        pattern: /\bnavigate?(?:s|d|ing|or|ion)?\b/gi,
        replacements: {
          'navigate': 'manage',
          'navigates': 'manages',
          'navigated': 'managed',
          'navigating': 'managing',
          'navigator': 'guide',
          'navigation': 'guidance'
        }
      },
      {
        pattern: /\bleverag(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'leverage': 'use',
          'leverages': 'uses',
          'leveraged': 'used',
          'leveraging': 'using'
        }
      },
      {
        pattern: /\bcultivat(?:e|es|ed|ing|ion)?\b/gi,
        replacements: {
          'cultivate': 'build',
          'cultivates': 'builds',
          'cultivated': 'built',
          'cultivating': 'building',
          'cultivation': 'development'
        }
      },
      {
        pattern: /\bempower(?:s|ed|ing|ment)?\b/gi,
        replacements: {
          'empower': 'equip',
          'empowers': 'equips',
          'empowered': 'equipped',
          'empowering': 'equipping',
          'empowerment': 'enablement'
        }
      },
      {
        pattern: /\bunderscor(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'underscore': 'point out',
          'underscores': 'points to',
          'underscored': 'called attention to',
          'underscoring': 'calling attention to'
        }
      },
      {
        pattern: /\billustrat(?:e|es|ed|ing|ion)?\b/gi,
        replacements: {
          'illustrate': 'show',
          'illustrates': 'shows',
          'illustrated': 'showed',
          'illustrating': 'showing',
          'illustration': 'example'
        }
      },
      {
        pattern: /\bhighlight(?:s|ed|ing)?\b/gi,
        replacements: {
          'highlight': 'identify',
          'highlights': 'identifies',
          'highlighted': 'touched on',
          'highlighting': 'reminding of'
        }
      },
      {
        pattern: /\bdelv(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'delve': 'examine',
          'delves': 'examines',
          'delved': 'examined',
          'delving': 'examining'
        }
      },
      {
        pattern: /\bdovetail(?:s|ed|ing)?\b/gi,
        replacements: {
          'dovetail': 'align',
          'dovetails': 'aligns',
          'dovetailed': 'aligned',
          'dovetailing': 'aligning'
        }
      },
      {
        pattern: /\bfalter(?:s|ed|ing)?\b/gi,
        replacements: {
          'falter': 'fall apart',
          'falters': 'falls apart',
          'faltered': 'fell apart',
          'faltering': 'falling apart'
        }
      },
      {
        pattern: /\bintegrat(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'integrate': 'combine',
          'integrates': 'combines',
          'integrated': 'combined',
          'integrating': 'combining'
        }
      },
      {
        pattern: /\bcatalyz(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'catalyze': 'spark',
          'catalyzes': 'sparks',
          'catalyzed': 'sparked',
          'catalyzing': 'sparking'
        }
      },
      {
        pattern: /\bmitigat(?:e|es|ed|ing|ion)?\b/gi,
        replacements: {
          'mitigate': 'reduce',
          'mitigates': 'reduces',
          'mitigated': 'reduced',
          'mitigating': 'reducing',
          'mitigation': 'reduction'
        }
      },
      {
        pattern: /\bsafeguard(?:s|ed|ing)?\b/gi,
        replacements: {
          'safeguard': 'protect',
          'safeguards': 'protects',
          'safeguarded': 'protected',
          'safeguarding': 'protecting'
        }
      },
      {
        pattern: /\bbolster(?:s|ed|ing)?\b/gi,
        replacements: {
          'bolster': 'reinforce',
          'bolsters': 'reinforces',
          'bolstered': 'reinforced',
          'bolstering': 'reinforcing'
        }
      },
      {
        pattern: /\bstreamlin(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'streamline': 'simplify',
          'streamlines': 'simplifies',
          'streamlined': 'simplified',
          'streamlining': 'simplifying'
        }
      },
      {
        pattern: /\bpossess(?:es|ed|ing)?\b/gi,
        replacements: {
          'possess': 'have',
          'possesses': 'has',
          'possessed': 'had',
          'possessing': 'having'
        }
      },
      {
        pattern: /\bgrappl(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'grapple': 'tackle',
          'grapples': 'tackles',
          'grappled': 'tackled',
          'grappling': 'tackling'
        }
      },
      {
        pattern: /\bgrasp(?:s|ed|ing)?\b/gi,
        replacements: {
          'grasp': 'understand',
          'grasps': 'understands',
          'grasped': 'understood',
          'grasping': 'understanding'
        }
      },
      {
        pattern: /\binnovatev(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'innovate': 'invent',
          'innovates': 'invents',
          'innovated': 'invented',
          'innovating': 'inventing'
        }
      },
      {
        pattern: /\bdemonstrat(?:e|es|ed|ing|ion)?\b/gi,
        replacements: {
          'demonstrate': 'show',
          'demonstrates': 'shows',
          'demonstrated': 'showed',
          'demonstrating': 'showing',
          'demonstration': 'display'
        }
      },
      {
        pattern: /\butiliz(?:e|es|ed|ing|ation)?\b/gi,
        replacements: {
          'utilize': 'use',
          'utilizes': 'uses',
          'utilized': 'used',
          'utilizing': 'using',
          'utilization': 'use'
        }
      },
      {
        pattern: /\bimplement(?:s|ed|ing|ation)?\b/gi,
        replacements: {
          'implement': 'enforce',
          'implements': 'enforces',
          'implemented': 'put into practice',
          'implementing': 'using',
          'implementation': 'use'
        }
      },
      {
        pattern: /\bemphasiz(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'emphasize': 'stress',
          'emphasizes': 'stresses',
          'emphasized': 'stressed',
          'emphasizing': 'stressing'
        }
      },
      {
        pattern: /\bnurtur(?:e|es|ed|ing)?\b/gi,
        replacements: {
          'nurture': 'grow',
          'nurtures': 'grows',
          'nurtured': 'grew',
          'nurturing': 'growing'
        }
      },
      {
        pattern: /\boptimiz(?:e|es|ed|ing|ation)?\b/gi,
        replacements: {
          'optimize': 'improve',
          'optimizes': 'improves',
          'optimized': 'improved',
          'optimizing': 'improving',
          'optimization': 'improvement'
        }
      }
    ]
  };
  
  // Word categories for reference
  export const wordCategories = {
    common_ai_words: [
      'utilize', 'facilitate', 'implement', 'demonstrate', 'establish',
      'optimize', 'enhance', 'leverage', 'comprehensive', 'subsequently',
      'nevertheless', 'furthermore', 'therefore', 'consequently'
    ],
    academic_formal: [
      'methodology', 'paradigm', 'scrutinize', 'ascertain', 'elucidate',
      'substantiate', 'corroborate', 'juxtapose', 'amalgamate', 'synthesize'
    ],
    overly_complex: [
      'conceptualize', 'articulate', 'enumerate', 'delineate', 'characterize',
      'exemplify', 'manifest', 'embody', 'encompass', 'constitute'
    ],
    business_jargon: [
      'leverage', 'optimize', 'streamline', 'facilitate', 'implement',
      'coordinate', 'orchestrate', 'prioritize', 'maximize', 'synergize'
    ]
  };
  
  // Usage statistics for reference
  export const usageNotes = {
    ai_tendency: "Words like 'utilize', 'facilitate', and 'implement' are used 3-5x more often by AI than humans",
    formality_scale: "Academic words like 'elucidate' and 'substantiate' are rarely used in casual conversation",
    context_matters: "Some formal words are appropriate in academic or professional contexts but sound unnatural in casual speech"
  };