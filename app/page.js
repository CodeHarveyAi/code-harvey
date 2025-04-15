'use client'

import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [rewritten, setRewritten] = useState('')
  const [loading, setLoading] = useState(false)
  const [tone, setTone] = useState('academic')
  const [copied, setCopied] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const handleTextChange = (e) => {
    const newText = e.target.value
    setText(newText)
    setWordCount(newText.trim().split(/\s+/).length)
  }

  const handleClear = () => {
    setText('')
    setRewritten('')
    setCopied(false)
    setWordCount(0)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rewritten)
    setCopied(true)
  }

  const handleRewrite = async () => {
    if (wordCount > 500) {
      alert('Word limit exceeded (500 words max). Please shorten your text.')
      return
    }

    setLoading(true)
    setCopied(false)

    const endpoint = tone === 'academic' ? '/api/rewrite/claude' : '/api/rewrite/openai'

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, tone }),
      })

      const data = await res.json()
      setRewritten(data.rewritten || 'No rewrite returned.')
    } catch (err) {
      console.error('Rewrite error:', err)
      setRewritten('Error occurred while rewriting.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center text-indigo-700">Code Harvey ✍️</h1>

      <div className="mb-4">
        <label htmlFor="tone" className="block font-medium mb-1">Select Tone:</label>
        <select
          id="tone"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="academic">Academic</option>
          <option value="standard">Standard</option>
        </select>
      </div>

      <textarea
        rows="6"
        placeholder="Paste academic text here (max 500 words)"
        value={text}
        onChange={handleTextChange}
        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
        <span>Word count: {wordCount}/500</span>
        <button
          onClick={handleClear}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleRewrite}
          disabled={loading}
          className={`px-6 py-2 rounded text-white font-semibold transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Thinking…' : 'Rewrite'}
        </button>
      </div>

      {rewritten && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Rewritten:</h2>
          <textarea
            value={rewritten}
            readOnly
            className="w-full h-48 p-4 border border-gray-300 rounded-lg shadow-sm resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={handleCopy}
              className="text-sm px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <div className="space-x-2">
              <button className="text-green-600 hover:scale-110 transition">👍</button>
              <button className="text-red-600 hover:scale-110 transition">👎</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
