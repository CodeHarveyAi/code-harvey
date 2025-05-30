// File: app/lib/transitionpatcher.js

import { detectTransitions } from '@/lib/transitiondetector';

export function patchTransitions(text, options = {}) {
  if (!text || typeof text !== 'string') return text;

  const defaultOptions = {
    contrast: true,
    result: true,
    addition: true,
    clarification: true,
    sequence: true,
    summary: true,
    reason: true,
    emphasis: true,
    dropRate: 0.12,
    informalRatio: 0.6,
    softPunctuation: true
  };

  const settings = { ...defaultOptions, ...options };
  const swaps = [];

  if (settings.contrast) {
    swaps.push({
      category: 'contrast',
      pattern: /([.;])\s*(However|Nevertheless|Nonetheless|In contrast|On the other hand),/gi,
      replacements: ['Still', 'Even so', 'Then again', 'At the same time', 'But']
    });
  }

  if (settings.result) {
    swaps.push({
      category: 'result',
      pattern: /([.;])\s*(Therefore|Thus|As a result|Consequently|Hence),/gi,
      replacements: ['That’s why', 'So', 'Because of this', 'Following that', 'It turned out']
    });
  }

  if (settings.addition) {
    swaps.push({
      category: 'addition',
      pattern: /([.;])\s*(Furthermore|Additionally|Moreover|Also|In addition),/gi,
      replacements: ['What’s more', 'Not only that', 'On top of that', 'And', 'Plus']
    });
  }

  if (settings.clarification) {
    swaps.push({
      category: 'clarification',
      pattern: /([.;])\s*(In other words|To put it differently|That is to say),/gi,
      replacements: ['Put differently', 'What that means is', 'To say it another way']
    });
  }

  if (settings.sequence) {
    swaps.push({
      category: 'sequence',
      pattern: /([.;])\s*(Then|Subsequently|Finally|Next|Afterward),/gi,
      replacements: ['After that', 'Eventually', 'Soon after', 'Later on']
    });
  }

  if (settings.summary) {
    swaps.push({
      category: 'summary',
      pattern: /([.;])\s*(In conclusion|To summarize|To sum up|In short|Overall),/gi,
      replacements: ['All in all', 'To wrap up', 'In closing']
    });
  }

  if (settings.reason) {
    swaps.push({
      category: 'reason',
      pattern: /([.;])\s*(Because|Since|Due to|As|Owing to),/gi,
      replacements: ['Given that', 'Seeing that', 'Considering']
    });
  }

  if (settings.emphasis) {
    swaps.push({
      category: 'emphasis',
      pattern: /([.;])\s*(Clearly|Indeed|Obviously|Undoubtedly|Importantly),/gi,
      replacements: ['It’s worth noting', 'What stands out is', 'Notably']
    });
  }

  swaps.forEach(({ pattern, replacements, category }) => {
    text = text.replace(pattern, (match, punct) => {
      if (transitionCount >= 1) return match;

      if (Math.random() < settings.dropRate) return `${punct} `;

      const informalSet = replacements.slice(0, Math.ceil(replacements.length * settings.informalRatio));
      const chosen = informalSet[Math.floor(Math.random() * informalSet.length)];

      if (detectTransitions[category]) {
        transitionTracker[category][chosen] = (transitionTracker[category][chosen] || 0) + 1;
      }

      transitionCount++;
      const trailingComma = settings.softPunctuation ? '' : ',';
      return `${punct} [[TRANS:${chosen}]]${trailingComma}`;
    });
  });

  return text;
}

export function finalizeTransitions(text) {
  if (!text || typeof text !== 'string') return text;

  return text.replace(/\[\[TRANS:(.*?)\]\](,?)/g, (_, phrase) => {
    // Restore transition formatting based on type
    return phrase.match(/^(So|But|And|Yet)$/i) ? `${phrase} ` : `${phrase}, `;
  });
}