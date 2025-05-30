// File: app/page.js - Updated version

'use client';

import { useState, useEffect } from 'react';
import { AIAnalysisView } from '@/components/AIAnalysisView';

function ReplacementChooser({ text, replacements }) {
  const [selectedReplacements, setSelectedReplacements] = useState({});

  const handleReplacement = async (original, replacement) => {
    setSelectedReplacements(prev => ({ ...prev, [original]: replacement }));

    // Use the updateReplacementMap function
    // updateReplacementMap(original, replacement);

    try {
      const response = await fetch('/api/update-replacement-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiWord: original, humanWord: replacement })
      });

      if (!response.ok) {
        throw new Error('Failed to update replacement map');
      }
    } catch (error) {
      console.error('Error updating replacement map:', error);
    }
  };

  return (
    <div>
      {text.split(/\s+/).map((word, index) => {
        const cleanWord = word.replace(/[^\w\s]/g, '');
        const options = replacements[cleanWord] || [];
        return (
          <span key={index}>
            {options.length > 0 ? (
              <select onChange={(e) => handleReplacement(cleanWord, e.target.value)}>
                <option value="">{cleanWord}</option>
                {Array.isArray(options) ? options.map((option, i) => (
                  <option key={i} value={option}>{option}</option>
                )) : null}
              </select>
            ) : (
              <span>{word} </span>
            )}
          </span>
        );
      })}
      {/* Display selected replacements */}
      <div>
        <h3>Selected Replacements:</h3>
        <ul>
          {Object.entries(selectedReplacements).map(([original, replacement]) => (
            <li key={original}>{original} ➝ {replacement}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState(''); // Define phase state
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [databaseStats, setDatabaseStats] = useState(null);

  // Load database stats on mount and after processing
  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  async function fetchDatabaseStats() {
    try {
      const response = await fetch('/api/rewrite/ai-stats');
      if (response.ok) {
        const stats = await response.json();
        setDatabaseStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch AI stats:', error);
    }
  }

  async function handleRewrite() {
    if (!inputText.trim() || !phase) {
      setError('Please enter text and select a phase');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisData(null);

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, phase, returnAnalysis: true })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite');
      }

      setOutputText(data.output);
      
      // Set analysis data if available
      if (data.analysis) {
        setAnalysisData(data.analysis);
        setShowAnalysis(true);
      }

      if (data.phaseOutputs) {
        // Show intermediate outputs if running all phases
        console.log('Phase outputs:', data.phaseOutputs);
      }
      
      // Refresh database stats after processing
      await fetchDatabaseStats();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <h1>Harvey Rewriter with AI Analysis</h1>

        {/* Database Stats Dashboard */}
        {databaseStats && (
          <div style={{
            background: '#f3f4f6',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Total Analyses</h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>
                {databaseStats.statistics?.totalAnalyses || 0}
              </p>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Words Analyzed</h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>
                {databaseStats.statistics?.wordsAnalyzed || 0}
              </p>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Last Updated</h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
                {databaseStats.statistics?.lastUpdated 
                  ? new Date(databaseStats.statistics.lastUpdated).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>
        )}

        {/* Top AI Words */}
        {databaseStats && Object.keys(databaseStats.wordFrequencies || {}).length > 0 && (
          <div style={{
            background: '#f3f4f6',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h3>Top AI Words in Database</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
              {Object.entries(databaseStats.wordFrequencies)
                .filter(([_, data]) => data.occurrences > 0)
                .sort((a, b) => b[1].occurrences - a[1].occurrences)
                .slice(0, 10)
                .map(([word, data]) => (
                  <div key={word} style={{
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    <strong>{word}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {data.occurrences}x | AI: {(data.claudeAIProb * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Main Interface */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Input Section */}
          <div>
            <h2>Input</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to rewrite..."
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="phase">Select Phase: </label>
              <select
                id="phase"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
              >
                <option value="">--Select--</option>
                <option value="0">Phase 0 - AI Word Replacement</option>
                <option value="1">Phase 1</option>
                <option value="2">Phase 2</option>
                <option value="3">Phase 3</option>
                <option value="4">Phase 4</option>
                <option value="5">Phase 5</option>
                <option value="6">Phase 6</option>
                <option value="6.5">Phase 6.5 - Detox</option>
                <option value="7">Phase 7</option>
                <option value="all">🔄 Run All Phases</option>
              </select>
            </div>

            <button
              onClick={handleRewrite}
              disabled={loading}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 2rem',
                background: loading ? '#ccc' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Rewrite'}
            </button>

            {error && (
              <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
            )}
          </div>

          {/* Output Section */}
          <div>
            <h2>Output</h2>
            <textarea
              value={outputText}
              readOnly
              placeholder="Rewritten text will appear here..."
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem',
                background: '#f9f9f9'
              }}
            />
          </div>
        </div>

        {/* Analysis View */}
        {showAnalysis && analysisData && (
          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              style={{
                padding: '0.5rem 1rem',
                marginBottom: '1rem',
                background: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showAnalysis ? 'Hide' : 'Show'} AI Analysis
            </button>
            <AIAnalysisView analysis={analysisData} />
          </div>
        )}

        {/* Render ReplacementChooser after processing */}
        {outputText && (
          <ReplacementChooser text={outputText} replacements={[]} />
        )}
      </div>
    </main>
  );
}