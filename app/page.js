'use client';

import { useState } from 'react';

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('7pass');

  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
  const inputTooShort = wordCount > 0 && wordCount < 50;
  const inputTooLong = wordCount > 150;
  const inputInvalid = inputTooShort || inputTooLong;

  async function handleRewrite() {
    setLoading(true);
    setError('');
    setOutputText('');

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputText, phase })
      });

      const raw = await response.text();
      console.log('🛰  raw text from API:', raw);

      let data;
      try {
        data = JSON.parse(raw);
        console.log('🛰  parsed JSON from API:', data);
      } catch {
        console.warn('⚠️ response not JSON:', raw);
      }

      if (!response.ok) {
        const msg = data?.error || raw;
        setError(`Server Error (${response.status}):\n${msg}`);
      } else {
        if (data && typeof data.rewrite === 'string') {
          setOutputText(data.rewrite);
        } else {
          setOutputText(raw);
        }
      }
    } catch (e) {
      console.error('Fetch failed:', e);
      setError(`Fetch Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <h1>Harvey Rewriter</h1>

        <label>
          Phase:&nbsp;
          <select value={phase} onChange={e => setPhase(e.target.value)}>
            <option value="0">Phase 0 – Precheck</option>
            <option value="1">Phase 1 – Structure</option>
            <option value="2">Phase 2 – Tone</option>
            <option value="3">Phase 3 – Repetition</option>
            <option value="4">Phase 4 – Transitions</option>
            <option value="5">Phase 5 – Rhythm</option>
            <option value="6">Phase 6 – Claude AI Check</option>
            <option value="7">Phase 7 – Final Voice</option>
            <option value="7pass">Run Full 7-Pass</option>
          </select>
        </label>

        <textarea
          rows={8}
          style={{
            width: '100%',
            resize: 'vertical',
            margin: '1rem 0 0.25rem 0',
            padding: '1rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
          placeholder="Paste your text here..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />

        {/* Word count + validation */}
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: inputInvalid ? 'red' : '#666' }}>
          Word count: {wordCount} &nbsp;
          {inputTooShort && `(too short – minimum is 60)`}
          {inputTooLong && `(too long – maximum is 150)`}
        </div>

        <button
          onClick={handleRewrite}
          disabled={loading || !inputText || inputInvalid}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: inputText && !loading && !inputInvalid ? 'pointer' : 'not-allowed',
            background: inputInvalid ? '#ccc' : '#222',
            color: '#fff',
            border: 'none'
          }}
        >
          {loading ? 'Processing…' : 'Run Harvey'}
        </button>

        {error && (
          <pre style={{ color: 'red', whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            {error}
          </pre>
        )}

        {outputText && (
          <div style={{ marginTop: '1rem' }}>
            <h2>Output</h2>
            <pre style={{
              whiteSpace: 'pre-wrap',
              background: '#f4f4f4',
              padding: '1rem',
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              {outputText}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
