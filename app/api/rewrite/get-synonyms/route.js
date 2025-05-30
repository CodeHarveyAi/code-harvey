// ✅ File: /app/api/rewrite/get-synonyms/route.js
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get('word');
    
    if (!word) {
      return new Response(JSON.stringify({ error: 'Missing word parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Synonym API] Looking up: "${word}"`);

    let synonyms = [];
    
    // Try API Ninjas first (if you have key)
    const apiNinjasKey = process.env.API_NINJAS_KEY;
    if (apiNinjasKey) {
      try {
        synonyms = await getAPINinjasSynonyms(word, apiNinjasKey);
        if (synonyms.length > 0) {
          console.log(`[Synonym API] ✅ Found ${synonyms.length} synonyms via API Ninjas`);
          return new Response(JSON.stringify({ synonyms, source: 'api-ninjas' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (err) {
        console.log('[Synonym API] API Ninjas failed, trying next...');
      }
    }

    // IMPROVED Datamuse (works immediately, no registration)
    try {
      synonyms = await getImprovedDatamuseSynonyms(word);
      console.log(`[Synonym API] ✅ Found ${synonyms.length} synonyms via Datamuse`);
      return new Response(JSON.stringify({ synonyms, source: 'datamuse-improved' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('[Synonym API] All sources failed:', err);
      
      // Manual fallback for common words
      const manualSynonyms = getManualSynonyms(word);
      if (manualSynonyms.length > 0) {
        console.log(`[Synonym API] ✅ Using manual fallback for "${word}"`);
        return new Response(JSON.stringify({ synonyms: manualSynonyms, source: 'manual-fallback' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'All synonym sources failed' }), { 
        status: 500 
      });
    }

  } catch (err) {
    console.error('[Synonym API] ❌', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

// API Ninjas - Get instant API key at https://www.api-ninjas.com/api/thesaurus
async function getAPINinjasSynonyms(word, apiKey) {
  const response = await fetch(
    `https://api.api-ninjas.com/v1/thesaurus?word=${encodeURIComponent(word)}`,
    {
      headers: {
        'X-Api-Key': apiKey
      }
    }
  );
  
  const data = await response.json();
  
  if (data.synonyms && Array.isArray(data.synonyms)) {
    return data.synonyms
      .filter(syn => syn.length > 2 && syn !== word.toLowerCase())
      .sort((a, b) => a.length - b.length) // Shorter words first (more informal)
      .slice(0, 5);
  }
  
  return [];
}

// MUCH BETTER Datamuse (works immediately, no key needed)
async function getImprovedDatamuseSynonyms(word) {
  // Use 'rel_syn' for TRUE synonyms instead of 'ml' for "means like"
  const response = await fetch(
    `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=15`
  );
  
  const data = await response.json();
  
  if (!Array.isArray(data)) return [];
  
  // Filter for quality and prioritize informal words
  const filteredSynonyms = data
    .filter(item => {
      const synonym = item.word.toLowerCase();
      return (
        synonym.length > 2 &&
        synonym !== word.toLowerCase() &&
        item.score > 300 && // Lower threshold but still quality
        !synonym.includes('_') && // Remove compound words
        !synonym.includes('-') && // Remove hyphenated words
        /^[a-zA-Z]+$/.test(synonym) && // Only letters
        !synonym.endsWith('ing') && // Remove gerunds (usually longer)
        !synonym.endsWith('tion') && // Remove formal suffixes
        !synonym.endsWith('ness') &&
        !synonym.endsWith('ment')
      );
    })
    .map(item => item.word)
    .sort((a, b) => {
      // Prioritize shorter, simpler words (more informal)
      if (a.length !== b.length) return a.length - b.length;
      // Secondary sort by common English words
      const commonWords = ['show', 'use', 'help', 'start', 'end', 'make', 'get', 'give', 'take', 'work', 'find', 'put', 'see', 'tell', 'try', 'keep', 'come', 'think', 'look', 'want', 'say', 'includes', 'covers', 'goes'];
      const aIsCommon = commonWords.includes(a.toLowerCase());
      const bIsCommon = commonWords.includes(b.toLowerCase());
      if (aIsCommon && !bIsCommon) return -1;
      if (!aIsCommon && bIsCommon) return 1;
      return 0;
    })
    .slice(0, 5);

  return filteredSynonyms;
}

// Manual fallback for common AI words
function getManualSynonyms(word) {
  const manualMap = {
    'encompasses': ['includes', 'covers', 'contains'],
    'facilitate': ['help', 'make easier', 'assist'],
    'demonstrate': ['show', 'prove', 'display'],
    'utilize': ['use', 'employ', 'apply'],
    'enhance': ['improve', 'boost', 'strengthen'],
    'foster': ['support', 'encourage', 'help'],
    'leverage': ['use', 'apply', 'employ'],
    'implement': ['put in place', 'carry out', 'apply'],
    'optimize': ['improve', 'perfect', 'enhance'],
    'navigate': ['handle', 'deal with', 'manage'],
    'possess': ['have', 'own', 'hold'],
    'enable': ['allow', 'let', 'help'],
    'extends': ['goes', 'reaches', 'stretches'],
    'maintaining': ['keeping', 'holding', 'preserving'],
    'achieving': ['reaching', 'getting', 'attaining'],
    'combination': ['mix', 'blend', 'set'],
    'qualities': ['traits', 'features', 'aspects']
  };
  
  return manualMap[word.toLowerCase()] || [];
}