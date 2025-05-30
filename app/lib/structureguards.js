// File: app/lib/structureguards.js

export function removeChattyLanguage(text) {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace(/^I\s+.*?[\.\!\?]\s*/gi, '')  // Remove leading I-statements
    .replace(/^(Absolutely|Sure!|Yes,|Totally|I think|I believe|Let me tell you|You're right)[^.!?]*[.!?]/gi, '') // Remove conversational openers
    .replace(/\b(I|we|you|me|us|my|our|your)\b/gi, '') // Strip remaining pronouns
    .replace(/\s{2,}/g, ' ') // Normalize extra spaces
    .trim();
}
