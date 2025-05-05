// ✅ File: /app/lib/subjectcontrol.js
// Role: Combines subject-specific entropy mapping, tweaks, and randomization

// -----------------------------------------------------------------------------
// Part 1: Subject Entropy Map
// -----------------------------------------------------------------------------

export const subjectEntropyMap = {
    STEM: {
      sentenceOpeners: ['Technology', 'In practice', 'Systems can', 'A study found that'],
      connectorWords: ['however', 'in contrast', 'similarly', 'therefore'],
      verbNounRatio: 0.9, // more technical verbs
      styleHints: ['use direct phrasing', 'insert statistical reference']
    },
    History: {
      sentenceOpeners: ['Historians argue', 'In the past', 'It is recorded that', 'During this period'],
      connectorWords: ['meanwhile', 'by comparison', 'subsequently'],
      verbNounRatio: 0.6,
      styleHints: ['vary tense', 'use specific names/places', 'avoid symmetry']
    },
    Business: {
      sentenceOpeners: ['In recent years', 'Executives often', 'Strategy includes', 'The company reported'],
      connectorWords: ['thus', 'as a result', 'notably'],
      verbNounRatio: 0.75,
      styleHints: ['remove generic claims', 'cut buzzwords', 'trim conclusions']
    },
    Healthcare: {
      sentenceOpeners: ['Clinicians often', 'Health data shows', 'Hospitals manage', 'Patients experience'],
      connectorWords: ['additionally', 'in response', 'this can lead to'],
      verbNounRatio: 0.7,
      styleHints: ['soften conclusions', 'avoid absolutes', 'mix short/medium-length sentences']
    }
  };
  
  // -----------------------------------------------------------------------------
  // Part 2: Subject-Specific Tweaks
  // -----------------------------------------------------------------------------
  
  export function applySubjectTweaks(output, subjectType) {
    switch (subjectType) {
      case 'STEM':
        return injectAbruptStarter(output);
      case 'History':
        return varySentenceAnchors(output);
      case 'Business':
        return removeSweepingPhrases(output);
      default:
        return output;
    }
  }
  
  function injectAbruptStarter(text) {
    return text.replace(/^[A-Z][^.?!]+[.?!]/, 'Technology changes fast. ' + text);
  }
  
  function varySentenceAnchors(text) {
    return text.replace(/\b(It was|There was|This meant)\b/g, 'Historians argue');
  }
  
  function removeSweepingPhrases(text) {
    return text.replace(/\b(success is inevitable|this proves|without a doubt)\b/gi, '');
  }
  
  // -----------------------------------------------------------------------------
  // Part 3: Subject-Based Randomization
  // -----------------------------------------------------------------------------
  
  export function randomizeBySubject(text, subject = 'General') {
    const entropyProfile = subjectEntropyMap[subject];
    if (!entropyProfile) return text;
  
    let randomized = text;
  
    // Add random sentence starter at beginning
    const starter = pickRandom(entropyProfile.sentenceOpeners);
    randomized = starter + '. ' + randomized;
  
    // Optional: replace connectors
    entropyProfile.connectorWords.forEach(connector => {
      if (randomized.includes('however') && connector !== 'however') {
        randomized = randomized.replace('however', connector);
      }
    });
  
    // Optional: add small entropy-based tweaks here
  
    return randomized;
  }
  
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }