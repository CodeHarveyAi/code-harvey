// File: app/api/ai-stats/route.js

import { AIWordDatabaseUpdater } from '@/Claude/aidatabaseupdater.js';

export async function GET() {
  try {
    const updater = new AIWordDatabaseUpdater();
    const statistics = await updater.getStatistics();
    const wordFrequencies = await updater.getWordFrequencies();
    
    return Response.json({
      statistics,
      wordFrequencies
    });
  } catch (error) {
    console.error('Error fetching AI stats:', error);
    return Response.json({ error: 'Failed to fetch AI stats' }, { status: 500 });
  }
}