export function injectAcademicImperfection(subject, output) {
    if (!output || typeof output !== 'string') return output;
  
    const flaws = {
      healthcare: [
        "In practice, leadership in healthcare doesn't always follow a clear model.",
        "Some teams may respond differently depending on how leadership is delivered.",
        "These ideas might sound ideal, but real settings often make things less predictable.",
      ],
      business: [
        "What works for one company might not work for another.",
        "Managers sometimes struggle to balance profit and ethics.",
        "Even the best strategies can fall short without proper execution.",
      ],
      philosophy: [
        "Of course, such ideas are still up for debate.",
        "This point has been challenged by several thinkers in the past.",
        "It's worth noting that some may interpret this differently.",
      ],
      stem: [
        "That said, data doesn't always align perfectly with theory.",
        "Real-world outcomes often introduce variability.",
        "Sometimes, variables can produce surprising results.",
      ],
      generic: [
        "Not everyone would agree with this perspective.",
        "There's room for interpretation depending on the context.",
        "These statements reflect one side of a broader conversation.",
      ],
    };
  
    // Pick a category or default
    const inserts = flaws[subject.toLowerCase()] || flaws.generic;
  
    // Randomly pick a sentence
    const injection = inserts[Math.floor(Math.random() * inserts.length)];
  
    // Decide where to place it (e.g., after first or second sentence)
    const split = output.split(/(?<=[.?!])\s+/); // splits only on full stop boundaries
    if (split.length < 2) return output; // skip if too short
  
    // Inject after second sentence
    split.splice(2, 0, ' ' + injection);
  
    // Rebuild and clean up
    const final = split.join('.').replace(/\s+/g, ' ').trim();
    return final.endsWith('.') ? final : final + '.';
  }
  