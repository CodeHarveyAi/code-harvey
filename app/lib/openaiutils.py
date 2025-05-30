# /lib/openaiutils.py

import openai
import os

# Set your API key securely using environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

async def gpt_restructure(text: str) -> str:
    prompt = f"""
You are rewriting an academic paragraph to sound more human. 
Break AI-style patterns like rule-of-three, mirrored syntax, and flat rhythm. 
Keep the meaning and tone, but make it feel like a stressed student wrote it.

TEXT:
{text}
    """

    # GPT API call
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        temperature=0.95,
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}]
    )

    # Return the actual text GPT responds with
    return response.choices[0].message["content"].strip()
