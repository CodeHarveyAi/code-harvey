import { useState } from 'react';
import { updateWordReplacement } from '@/lib/api.js'; // Ensure this path is correct

export default function HumanizedText({ text, replacements }) {
  const [hoveredWord, setHoveredWord] = useState(null);

  const handleReplacement = async (original, replacement) => {
    await updateWordReplacement(original, replacement);
    setHoveredWord(null); // Reset hovered word after replacement
  };

  const renderWord = (word, index) => {
    const clean = word.replace(/[^\w\s]/g, '');
    const altWords = replacements[clean];
    if (!altWords) return <span key={index}> {word} </span>;

    return (
      <span key={index} className="relative group cursor-pointer">
        <span
          className="underline decoration-dotted underline-offset-2 text-red-500"
          onMouseEnter={() => setHoveredWord(index)}
          onMouseLeave={() => setHoveredWord(null)}
        >
          {word}
        </span>
        {hoveredWord === index && (
          <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow p-1 z-50">
            {altWords.map((alt, i) => (
              <div
                key={i}
                onClick={() => handleReplacement(clean, alt)}
                className="hover:bg-gray-200 px-2 py-1 text-sm"
              >
                {alt}
              </div>
            ))}
          </div>
        )}
      </span>
    );
  };

  return <p className="leading-7 text-lg flex flex-wrap">{text.split(/(\s+)/).map(renderWord)}</p>;
}
