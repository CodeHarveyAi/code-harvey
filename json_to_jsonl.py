import json

# === CONFIG ===
input_path = "clean_patternbreaker_0521.json"       # <-- Replace with your real file name
output_path = "patternbreaker_0521_final.jsonl"     # <-- Output file name

# === CONVERT JSON TO JSONL ===
with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

with open(output_path, "w", encoding="utf-8") as f:
    for entry in data:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

print(f"✅ Done! Saved as {output_path}")
