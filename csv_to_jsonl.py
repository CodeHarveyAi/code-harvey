#!/usr/bin/env python
"""
json_to_jsonl_mistral_robust.py
Convert a JSON conversation list (system / user / assistant)
to Mistral‑style JSONL fine‑tuning format.

Usage:
    python json_to_jsonl_mistral_robust.py input.json output.jsonl
"""

import argparse
import json
import sys
from pathlib import Path


def die(msg: str):
    """Print an error and bail."""
    print(f"🔥  {msg}")
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Convert JSON → JSONL (Mistral format)."
    )
    parser.add_argument("input", help="Input JSON file (list of conversation objects)")
    parser.add_argument("output", help="Output JSONL file")
    args = parser.parse_args()

    in_path = Path(args.input).expanduser()
    out_path = Path(args.output).expanduser()

    if not in_path.exists():
        die(f"Input file not found: {in_path}")

    # ------------------------------------------------------------------ load
    try:
        raw = in_path.read_text(encoding="utf-8")
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        die(f"JSON is invalid: {e}")

    # ---------------------------------------------------------------- normalize
    if isinstance(data, dict):
        data = [data]  # wrap single conversation object for consistency

    if not isinstance(data, list):
        die("Top‑level JSON must be a list (or a single object).")

    # ---------------------------------------------------------------- convert
    written = 0
    skipped = 0
    with out_path.open("w", encoding="utf-8") as fout:
        for idx, entry in enumerate(data, 1):
            system_txt = (entry.get("system") or "").strip()
            user_txt = (entry.get("user") or "").strip()
            assistant_txt = (entry.get("assistant") or "").strip()

            if not assistant_txt:
                skipped += 1
                print(f"⏭️  Skipping entry {idx}: empty assistant response.")
                continue

            # Build prompt
            prompt_lines = []
            if system_txt:
                prompt_lines.append(system_txt)
            if user_txt:
                prompt_lines.append(f"User: {user_txt}")
            prompt_lines.append("Assistant:")
            prompt = "\n".join(prompt_lines)

            # Add leading space for tokenizer friendliness
            completion = " " + assistant_txt

            fout.write(
                json.dumps({"prompt": prompt, "completion": completion}, ensure_ascii=False)
                + "\n"
            )
            written += 1

    # ---------------------------------------------------------------- report
    print(f"✅  Wrote {written} entries → {out_path}")
    if skipped:
        print(f"ℹ️  Skipped {skipped} entry(ies) with blank assistant text.")


if __name__ == "__main__":
    main()
