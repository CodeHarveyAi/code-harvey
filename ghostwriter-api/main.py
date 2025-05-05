from fastapi import FastAPI, Request, HTTPException
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
model_id = os.getenv("MODEL_ID")  # This should be your fine-tuned model ID

@app.post("/ghostwrite")
async def ghostwrite(request: Request):
    try:
        body = await request.json()
        user_input = body.get("text")
        voice = body.get("voice", "jo_default")  # Optional voice selector for future

        if not user_input:
            raise HTTPException(status_code=400, detail="No input text provided.")

        response = client.chat.completions.create(
            model=model_id,
            messages=[
                {
                    "role": "system",
                    "content": "Rewrite the text in Jo’s voice: academic with natural flow and student realism."
                },
                {
                    "role": "user",
                    "content": user_input
                }
            ],
            temperature=0.6,
            max_tokens=1024
        )

        rewritten_text = response.choices[0].message.content
        return {"rewritten_text": rewritten_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
