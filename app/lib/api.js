export async function updateWordReplacement(original, replacement) {
  try {
    const response = await fetch('/api/update-word-replacement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldWord: original, newWord: replacement })
    });

    if (!response.ok) {
      throw new Error('Failed to update word replacement');
    }

    const data = await response.json();
    console.log('Replacement updated successfully:', data);
  } catch (error) {
    console.error('Error updating word replacement:', error);
  }
}
