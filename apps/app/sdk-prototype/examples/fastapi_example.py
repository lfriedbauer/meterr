# FastAPI + Meterr Integration Example
from fastapi import FastAPI
from meterr import MeterrClient
import openai

app = FastAPI()
meterr = MeterrClient(api_key="your-meterr-key")

# Wrap OpenAI client
openai_tracked = meterr.track_costs(
    openai,
    tags={"app": "fastapi-demo", "env": "production"}
)

@app.post("/generate")
async def generate_text(prompt: str):
    # Costs automatically tracked
    response = await openai_tracked.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Get cost for this request
    cost = meterr.get_last_request_cost()
    
    return {
        "response": response.choices[0].message.content,
        "cost": cost,
        "tokens": response.usage.total_tokens
    }