'use client'
import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRewrite() {
    setLoading(true);
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setRewritten(data.rewritten);
    } catch (err) {
      setRewritten('Error occurred while rewriting.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Code Harvey ✍️</h1>
      <textarea
        rows="5"
        cols="60"
        placeholder="Paste academic text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={handleRewrite} disabled={loading}>
        {loading ? 'Rewriting...' : 'Rewrite'}
      </button>
      <h2>Rewritten:</h2>
      <p>{rewritten}</p>
    </main>
  );
}
