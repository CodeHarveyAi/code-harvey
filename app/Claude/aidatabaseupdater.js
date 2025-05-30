// File: app/lib/databaseUpdater.js

import fs from 'fs/promises';
import path from 'path';

export class AIWordDatabaseUpdater {
  constructor(dbPath = './app/data/aiWordFrequencies.json') {
    this.dbPath = path.resolve(dbPath); // Use path.resolve to ensure absolute path
    this.pendingUpdates = new Map();
    this.updateInterval = 5000; // Save every 5 seconds
    this.startAutoSave();
  }

  async loadDatabase() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log('[DB] Creating new database...');
      return {
        wordFrequencies: {},
        replacementGroups: {},
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async updateWordProbability(word, aiProbability, context) {
    // Queue updates for batch processing
    const existing = this.pendingUpdates.get(word) || {
      occurrences: 0,
      totalProb: 0,
      contexts: []
    };

    existing.occurrences++;
    existing.totalProb += aiProbability;
    existing.contexts.push(context);
    existing.avgProb = existing.totalProb / existing.occurrences;

    this.pendingUpdates.set(word, existing);
  }

  async saveToFile() {
    if (this.pendingUpdates.size === 0) return;

    console.log(`[DB] Saving ${this.pendingUpdates.size} word updates...`);

    // Load current database
    const db = await this.loadDatabase();

    // Apply updates
    for (const [word, updates] of this.pendingUpdates) {
      const existing = db.wordFrequencies[word] || {
        aiFreq: 0,
        humanFreq: 0,
        ratio: 0,
        claudeAIProb: 0,
        occurrences: 0
      };

      // Update with Claude's analysis
      existing.claudeAIProb = updates.avgProb;
      existing.occurrences += updates.occurrences;
      
      // Adjust frequencies based on Claude's probability
      if (updates.avgProb > 0.7) {
        existing.aiFreq += updates.occurrences;
        existing.ratio = existing.aiFreq / (existing.humanFreq || 1);
      } else if (updates.avgProb < 0.3) {
        existing.humanFreq += updates.occurrences;
        existing.ratio = existing.aiFreq / (existing.humanFreq || 1);
      }

      db.wordFrequencies[word] = existing;
    }

    // Update replacement groups based on new data
    db.replacementGroups = this.updateReplacementGroups(db.wordFrequencies);
    db.lastUpdated = new Date().toISOString();

    // Save to file
    await fs.writeFile(
      this.dbPath, 
      JSON.stringify(db, null, 2),
      'utf-8'
    );

    console.log('[DB] Database updated successfully');
    this.pendingUpdates.clear();
  }

  updateReplacementGroups(wordFrequencies) {
    const groups = {};
    
    // Group words by similarity and AI probability
    const aiWords = Object.entries(wordFrequencies)
      .filter(([word, data]) => data.claudeAIProb > 0.6 || data.ratio > 3)
      .map(([word, data]) => ({ word, ...data }));

    const humanWords = Object.entries(wordFrequencies)
      .filter(([word, data]) => data.claudeAIProb < 0.4 || data.ratio < 2)
      .map(([word, data]) => ({ word, ...data }));

    // Create replacement mappings
    const replacementMap = {
      'explore_group': {
        aiWords: ['delve', 'delving'],
        humanWords: ['explore', 'look into', 'examine']
      },
      'important_group': {
        aiWords: ['crucial', 'pivotal', 'imperative'],
        humanWords: ['important', 'key', 'vital']
      },
      'improve_group': {
        aiWords: ['enhance', 'augment', 'amplify'],
        humanWords: ['improve', 'boost', 'strengthen']
      }
    };

    // Add new discoveries from Claude
    aiWords.forEach(({ word }) => {
      // Find appropriate group or create new one
      let foundGroup = false;
      
      for (const [groupName, group] of Object.entries(replacementMap)) {
        if (this.wordsSimilar(word, group.aiWords[0])) {
          if (!group.aiWords.includes(word)) {
            group.aiWords.push(word);
          }
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        // Create new group
        replacementMap[`${word}_group`] = {
          aiWords: [word],
          humanWords: [] // Will be filled by human alternatives
        };
      }
    });

    return replacementMap;
  }

  wordsSimilar(word1, word2) {
    // Simple similarity check - you could use more sophisticated methods
    const synonyms = {
      'delve': ['explore', 'investigate', 'examine'],
      'crucial': ['important', 'vital', 'key'],
      'enhance': ['improve', 'boost', 'strengthen'],
      'foster': ['support', 'encourage', 'promote']
    };

    return synonyms[word1]?.includes(word2) || synonyms[word2]?.includes(word1);
  }

  startAutoSave() {
    setInterval(() => {
      this.saveToFile().catch(console.error);
    }, this.updateInterval);
  }

  async logReplacements(replacements, source = 'unknown') {
    if (!replacements || replacements.length === 0) return;

    console.log(`[DB Updater] Logging ${replacements.length} replacements from ${source}`);

    for (const replacement of replacements) {
      // Update word probability based on the replacement
      await this.updateWordProbability(
        replacement.original.toLowerCase(),
        replacement.ratio ? replacement.ratio / 10 : 0.7, // Convert ratio to probability
        replacement.context || `Replaced with: ${replacement.replacement}`
      );
    }

    // Force save after logging all replacements
    await this.saveToFile();
    console.log(`[DB Updater] Saved ${replacements.length} replacements to database`);
  }

  async getStatistics() {
    try {
      const db = await this.loadDatabase();
      
      // Count words analyzed
      const wordsAnalyzed = Object.keys(db.wordFrequencies).length;
      
      // Count total analyses
      const totalAnalyses = Object.values(db.wordFrequencies)
        .reduce((sum, data) => sum + (data.occurrences || 0), 0);
      
      return {
        wordsAnalyzed,
        totalAnalyses,
        lastUpdated: db.lastUpdated
      };
    } catch (error) {
      console.error('[DB] Error getting statistics:', error);
      return {
        wordsAnalyzed: 0,
        totalAnalyses: 0
      };
    }
  }

  async getWordFrequencies() {
    try {
      const db = await this.loadDatabase();
      return db.wordFrequencies || {};
    } catch (error) {
      console.error('[DB] Error getting word frequencies:', error);
      return {};
    }
  }
}

