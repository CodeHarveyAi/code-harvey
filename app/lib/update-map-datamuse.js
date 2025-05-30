// This module updates a JSON file that maps AI-generated words to human-readable words.
import fs from 'fs';
import path from 'path';

const REPLACEMENT_FILE = path.resolve(process.cwd(), 'app', 'datamuse', 'datamuse_replacements.json');

export function updateReplacementMap(aiWord, humanWord) {
  try {
    if (!aiWord || !humanWord) throw new Error('Missing word input');

    // Load the file
    let map = {};
    if (fs.existsSync(REPLACEMENT_FILE)) {
      const raw = fs.readFileSync(REPLACEMENT_FILE, 'utf-8');
      map = JSON.parse(raw);
    }

    // Update or insert
    map[aiWord] = humanWord;

    // Save back to file
    fs.writeFileSync(REPLACEMENT_FILE, JSON.stringify(map, null, 2));

    // Log the word change
    console.log(`[Datamuse Replacement] "${aiWord}" was changed to "${humanWord}"`);

  } catch (err) {
    console.error('[ReplacementMap] ❌ Failed to update:', err.message);
  }
}
