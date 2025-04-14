import { getAnthropicClient } from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { text, tone } = req.body;
  const openAIKey = process.env.OPENAI_API_KEY;
  const claudeKey = process.env.ANTHROPIC_API_KEY;

  if (!text || !tone || !openAIKey || !claudeKey) {
    return res.status(400).json({ error: 'Missing required inputs or API keys' });
  }

  const bannedWords = [
    'crucial', 'essential', 'impactful', 'underscores', 'groundbreaking', 'empower',
    'pivotal', 'foster', 'enhance', 'critical', 'robust', 'transform',
    'nuanced', 'interplay', 'illuminate', 'delve', 'framework', 'interconnected',
    'interwoven', 'navigate', 'insight', 'dynamic', 'sheds light', 'lens'
  ];

  const containsBannedWords = (text) => {
    const lower = text.toLowerCase();
    return bannedWords.some(word => lower.includes(word));
  };

  try {
    if (tone === 'academic') {
      const anthropic = getAnthropicClient(claudeKey);
      const prompt = `
Rewrite the following paragraph in an academic tone that sounds natural and human — like a real college student under time pressure. Follow these strict rules:

1. DO NOT use these words: ${bannedWords.join(', ')}.
2. DO NOT add new content, summaries, commentary, or elaboration.
3. Match the number of sentences as closely as possible. Stay within the original word count range.
4. Use sentence variation — some short, some long, and no symmetrical mirrored structure.
5. Avoid robotic transitions like “Moreover,” “In conclusion,” or “Therefore.”
6. NEVER use phrases like “This paper,” “This section,” or “will examine.”
7. DO NOT use em dashes. Use commas or periods instead.
8. DO NOT use figurative language, poetic phrasing, or abstract intensity.
9. Write in third person only — no “I,” “we,” or “you.”
10. Keep it plain, grounded, clear, and readable for a college audience.
11. Output ONLY the rewritten paragraph — no commentary or introductions.

TEXT:
${text}
      `.trim();

      const claudeResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1500,
        system: "You are a writing assistant that rewrites academic paragraphs to sound realistic, human, and deadline-written. Avoid all AI-sounding phrasing.",
        messages: [{ role: "user", content: prompt }]
      });

      const claudeText = claudeResponse?.content?.[0]?.text?.trim();

      if (!claudeText || claudeText.startsWith('Here is')) {
        return res.status(200).json({ rewrite: 'Claude is thinking too hard... try again in a moment!' });
      }

      if (containsBannedWords(claudeText)) {
        console.log('Fallback triggered due to banned words in Claude output.');
        throw new Error('Claude used banned words — fallback to GPT.');
      }

      return res.status(200).json({ rewrite: claudeText });
    }

    if (tone === 'casual') {
      const casualPrompt = `
You are Harvey, a human rewriting assistant. Rewrite the following text to sound like a real student writing casually — like a reflection, journal entry, or relaxed thought process.

Rules:
- No dramatic or stiff
