// File: app/components/AIAnalysisView.jsx

export function AIAnalysisView({ analysis }) {
  if (!analysis) return null;

  // Handle different analysis formats (single vs array)
  const analysisData = Array.isArray(analysis) ? analysis[0]?.analysis : analysis;
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-bold mb-3">AI Word Analysis</h3>
      
      {/* Word Detection Table */}
      {analysisData?.wordsAnalyzed && analysisData.wordsAnalyzed.length > 0 && (
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Word</th>
              <th className="p-2">AI Probability</th>
              <th className="p-2">Context</th>
              <th className="p-2">Replacement</th>
            </tr>
          </thead>
          <tbody>
            {analysisData.wordsAnalyzed.map((word, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2 font-mono">{word.original}</td>
                <td className="p-2">
                  <span className={`font-bold ${word.ai_prob > 0.7 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {(word.ai_prob * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="p-2 text-sm">{word.context}</td>
                <td className="p-2 text-green-600">
                  {word.replacements?.[0]?.text || 'none'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Missed Words Alert */}
      {analysisData?.missedWords && analysisData.missedWords.length > 0 && (
        <div className="bg-red-50 p-3 rounded mb-4">
          <strong>⚠️ Missed AI Words:</strong> {analysisData.missedWords.join(', ')}
        </div>
      )}

      {/* Replacement Summary */}
      {analysisData?.replacements && analysisData.replacements.length > 0 && (
        <div className="bg-blue-50 p-3 rounded">
          <strong>Replacements Made:</strong>
          <ul className="mt-2">
            {analysisData.replacements.map((r, idx) => (
              <li key={idx}>
                <span className="line-through text-red-600">{r.original}</span>
                {' → '}
                <span className="text-green-600 font-medium">{r.replacement}</span>
                {r.forced && <span className="text-xs text-gray-500 ml-2">(forced)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show raw data structure for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600">Debug: Raw Analysis Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}