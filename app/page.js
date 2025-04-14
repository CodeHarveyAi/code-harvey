'use client'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [rewritten, setRewritten] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [warn, setWarn] = useState(false)
  const [feedback, setFeedback] = useState('')

  const MAX_WORDS = 500
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const overLimit = wordCount > MAX_WORDS

  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }, [text])

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 2000)
  }

  async function handleRewrite() {
    if (overLimit || loading) {
      setWarn(true)
      setTimeout(() => setWarn(false), 2000)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      setRewritten(data.rewritten)
      setFeedback('')
      showToast('Rewritten!')
    } catch {
      setRewritten('Error occurred while rewriting.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(rewritten)
    showToast('Copied!')
  }

  function handleClear() {
    setText('')
    setRewritten('')
    setFeedback('')
  }

  function handleFeedback(value) {
    setFeedback(value)
    showToast(value === 'up' ? 'Thanks for the 👍' : 'Got it 👎')
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 relative">
      {toast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300">
          {toast}
        </div>
      )}

      {warn && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300">
          {overLimit ? 'Too many words!' : 'Harvey is thinking. Please wait...'}
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">
        Code Harvey ✍️
      </h1>

      <textarea
        ref={inputRef}
        placeholder="Paste academic text here"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`w-full p-4 border rounded-lg shadow focus:outline-none resize-none focus:ring-2 ${
          overLimit ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'
        }`}
      />

      <div className="flex justify-between mt-2 text-sm">
        <span className={overLimit ? 'text-red-500' : 'text-gray-500'}>
          {wordCount} / {MAX_WORDS} words
        </span>
        <button
          onClick={handleClear}
          className="text-red-500 hover:text-red-700 underline"
        >
          Clear
        </button>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleRewrite}
          disabled={loading || overLimit}
          className={`px-6 py-2 rounded text-white font-semibold ${
            loading || overLimit ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Rewriting...' : 'Rewrite'}
        </button>
      </div>

      <h2 className="mt-10 text-2xl font-semibold text-gray-700">Rewritten:</h2>

      <div className="relative mt-2">
        <textarea
          readOnly
          value={rewritten}
          rows="6"
          className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 shadow-inner text-gray-800 resize-none"
        />
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1 text-sm text-white bg-indigo-500 hover:bg-indigo-600 rounded"
        >
          Copy
        </button>
      </div>

      {rewritten && (
        <div className="mt-4 flex gap-3 items-center">
          <span className="text-sm text-gray-600">Was this helpful?</span>
          <button
            onClick={() => handleFeedback('up')}
            className={`text-xl ${feedback === 'up' ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}
          >
            👍
          </button>
          <button
            onClick={() => handleFeedback('down')}
            className={`text-xl ${feedback === 'down' ? 'text-red-600' : 'text-gray-400 hover:text-red-500'}`}
          >
            👎
          </button>
        </div>
      )}
    </main>
  )
}