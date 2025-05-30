// lib/injectToneByTopic.js

export const toneMap = {
  healthcare:
    "Use a tone that is compassionate, grounded, and emotionally aware. Prioritize realism and clarity without exaggeration.",
  law:
    "Use a tone that is analytical and direct, with dry wit. Highlight contradictions subtly and avoid fluff or dramatics.",
  business:
    "Use a clear, efficient tone focused on real-world outcomes. Avoid buzzwords. Emphasize practicality over corporate polish.",
  humanities:
    "Use a reflective, thoughtful tone. Show intellectual depth and openness to multiple interpretations.",
  science:
    "Use a precise, objective tone. Focus on clarity, evidence, and cautious reasoning — not dramatization.",
  politics:
    "Use a critical, measured tone with restrained frustration. Point out hypocrisy and systemic flaws without emotional escalation.",
  war:
    "Use a blunt, morally serious tone. Do not soften violence. Highlight human cost and strategic consequences honestly.",
  social_justice:
    "Use a clear, honest tone with subtle urgency. Expose inequality using facts and grounded moral language.",
  environment:
    "Use a serious, concerned tone. Emphasize long-term consequences and responsible action without idealism.",
  education:
    "Use an informative, supportive tone. Stay balanced, emphasize clarity, and recognize broader social context.",
  technology:
    "Use a curious, forward-looking tone. Ask smart questions, explore risks and outcomes, and avoid hype.",
  general:
    "Use a natural student tone. Keep it readable, varied, and realistic. Avoid stiffness, over-polish, or robotic rhythm.",
};

export function injectToneInstruction(topic = "general") {
  const key = topic.toLowerCase().replace(/\s+/g, "_");
  const tone = toneMap[key] || toneMap["general"];
  return `🧠 [TONE INSTRUCTION]: ${tone}`;
}
