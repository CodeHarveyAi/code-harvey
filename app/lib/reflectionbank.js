export const ReflectionMap = {
  
  clarifier: [
    "That helps explain why it matters.",
    "It shows how the issue actually works.",
    "This helps make the idea more clear."
  ],
  contrast: [
    "Even then, things don’t always go that way.",
    "But that’s not always how it plays out.",
    "Still, that doesn’t apply in every case."
  ],
  limitation: [
    "Even with this, there’s still a point where it stops working.",
    "There are times when this just isn’t enough.",
    "It only goes so far in real situations."
  ],
  nuance: [
    "That adds a small detail people don’t always notice.",
    "It makes the issue more layered than it looks.",
    "There’s more to it once you take a closer look."
  ],
  consequence: [
    "That often changes what people end up doing.",
    "It affects what happens after the fact.",
    "This tends to change how people move forward."
  ],
  implication: [
    "This shows there might be more to think about.",
    "It points to something people may overlook.",
    "It brings up questions that matter later on."
  ],
  outcome: [
    "This is what people often see in the end.",
    "It changes what usually ends up happening.",
    "This is where most things seem to land."
  ],
  cause: [
    "That’s usually the reason behind what came next.",
    "It tends to start the process that follows.",
    "This is often what sets things in motion."
  ],
  observation: [
    "This is something people keep noticing.",
    "It comes up a lot when you look closely.",
    "It’s one of those things that shows up again and again."
  ]
};

/**
 * Get a reflection based on the ending type.
 */
export function getReflectionForEndingType(endingType) {
  if (!endingType || !ReflectionMap[endingType]) {
    return "That helps make things clearer.";
  }

  const options = ReflectionMap[endingType];
  return options[Math.floor(Math.random() * options.length)];
}
