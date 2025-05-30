import json
import re
import uuid
from pathlib import Path

# === INPUT (PASTE your raw JSON entries here) ===
raw_data = """
{"id": "pattern_a77f6bad", "label": "Subject + Verb + Object", "structure": "Subject + Verb + Object", "conditions": {"complexity": "auto"}, "example": ["Federal government websites often end in .gov or .mil."]},
{"id": "pattern_a318f707", "label": "Before + Verb-ing + Object, Clause", "structure": "Before + Verb-ing + Object, Clause", "conditions": {"complexity": "auto"}, "example": ["Before sharing sensitive information, make sure you’re on a federal government site."]},
{"id": "pattern_33596753", "label": "Subject + Verb + Direct Object + Prepositional Phrase + Gerund Phrase", "structure": "Subject + Verb + Direct Object + Prepositional Phrase + Gerund Phrase", "conditions": {"complexity": "auto"}, "example": ["The four stages of writing a book review are: introducing the book, outlining its contents, highlighting parts of the book by selecting particular chapters or themes, and giving a detailed evaluation."]}
"""  # Add more entries if needed

# === PARSE + FILTER ===
pattern_blocks = [b.strip() for b in raw_data.split("},") if b.strip()]
parsed = []
seen = set()

for block in pattern_blocks:
    if not block.endswith("}"):
        block += "}"
    try:
        item = json.loads(block)

        # Check for duplicate structure
        if item["structure"] in seen:
            continue
        seen.add(item["structure"])

        # Rule of Three detection
        sample = item["example"][0]
        if re.search(r'\b\w+(, \w+){2,}( and \w+)', sample):
            continue

        parsed.append(item)

    except json.JSONDecodeError:
        continue

# === FORMAT TO JAVASCRIPT MODULE ===
output = "export const JoPatternBank = [\n"
for p in parsed:
    output += f"""  {{
    id: "{p['id']}",
    label: "{p['label']}",
    structure: "{p['structure']}",
    conditions: {json.dumps(p['conditions'])},
    example: {json.dumps(p['example'])}
  }},
"""
output += "];\n"

# === WRITE OUTPUT FILE ===
Path("cleaned_jopatternbank.js").write_text(output, encoding="utf-8")
print("✅ Saved to cleaned_jopatternbank.js")
