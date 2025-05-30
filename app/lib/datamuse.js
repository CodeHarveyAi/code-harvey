/**
 * Fetch synonyms for a given word using the Datamuse API.
 * @param {string} word - The word to find synonyms for.
 * @returns {Promise<string[]>} - A promise that resolves to an array of synonyms.
 */
const motivationalFluff = new Set(['self-improvement', 'empower', 'unlock', 'inspire', 'transform']);

export async function fetchSynonyms(word) {
  try {
    // Construct the API URL with the word
    const response = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&md=p`);
    
    // Check if the response is OK
    if (!response.ok) {
      throw new Error('Failed to fetch synonyms');
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Fetch part of speech for the original word
    const originalPOS = data.find(item => item.word === word)?.tags?.find(tag => tag.startsWith('n') || tag.startsWith('v') || tag.startsWith('adj') || tag.startsWith('adv'));

    // Filter synonyms based on part of speech and motivational fluff
    return data
      .filter(item => {
        const pos = item.tags?.find(tag => tag.startsWith('n') || tag.startsWith('v') || tag.startsWith('adj') || tag.startsWith('adv'));
        return pos === originalPOS && !motivationalFluff.has(item.word);
      })
      .map(item => item.word);
  } catch (error) {
    console.error('Error fetching synonyms:', error);
    return [];
  }
}
