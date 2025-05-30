import json

TEMPLATE = {
    "input": {
        "messages": [
            {
                "role": "user",
                "content": ""
            }
        ],
        "tools": [],
        "parallel_tool_calls": True
    },
    "preferred_output": [
        {
            "role": "assistant",
            "content": ""
        }
    ],
    "non_preferred_output": [
        {
            "role": "assistant",
            "content": ""
        }
    ]
}

def convert_sft_to_dpo(
    input_path="patternbreaker_0521_final.openai.jsonl",
    output_path="patternbreaker_dpo_ready.jsonl",
    rejected_default="<<REPLACE WITH AI OUTPUT>>"
):
    with open(input_path, 'r', encoding='utf-8') as infile, open(output_path, 'w', encoding='utf-8') as outfile:
        for i, line in enumerate(infile):
            try:
                data = json.loads(line)
                messages = data.get("messages", [])
                user_msg = next((m["content"] for m in messages if m["role"] == "user"), "")
                assistant_msg = next((m["content"] for m in messages if m["role"] == "assistant"), "")

                new_entry = json.loads(json.dumps(TEMPLATE))  # deep copy
                new_entry["input"]["messages"][0]["content"] = user_msg
                new_entry["preferred_output"][0]["content"] = assistant_msg
                new_entry["non_preferred_output"][0]["content"] = rejected_default

                outfile.write(json.dumps(new_entry) + "\n")

            except Exception as e:
                print(f"[Line {i+1}] ❌ Skipped due to error: {e}")

if __name__ == "__main__":
    convert_sft_to_dpo()
