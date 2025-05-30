// File: app/test/testDatabaseUpdate.js
// Run this to test if the database updates

import { AIWordDatabaseUpdater } from '../Claude/aidatabaseupdater.js';

async function testDatabaseUpdate() {
  const updater = new AIWordDatabaseUpdater();
  
  console.log('Testing database update...');
  
  // Test update
  await updater.updateWordProbability('delve', 0.85, 'We need to delve deeper');
  await updater.updateWordProbability('crucial', 0.90, 'This is crucial for success');
  
  // Force save
  await updater.saveToFile();
  
  // Get stats
  const stats = await updater.getStatistics();
  console.log('Updated stats:', stats);
}

testDatabaseUpdate();