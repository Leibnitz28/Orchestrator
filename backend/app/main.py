import os
import uuid
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the project root (two levels up from this file)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import asyncio

from orchestrator import generate_campaign, OrchestratorError

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

app = FastAPI(
    title="Campaign Asset Orchestrator",
    description="Turn a raw campaign idea into a complete marketing asset package.",
    version="1.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request / Response models ---

class GenerateCampaignRequest(BaseModel):
    idea: str = Field(..., min_length=5, max_length=500)


# --- Routes ---

@app.get("/api/health")
async def health():
    return {"status": "ok", "mock_mode": MOCK_MODE}


@app.post("/api/generate-campaign")
async def generate_campaign_endpoint(body: GenerateCampaignRequest):
    idea = body.idea.strip()
    if not idea:
        raise HTTPException(status_code=422, detail="Idea must not be empty after stripping whitespace.")

    # 1. Generate campaign package (blocking call → threadpool)
    loop = asyncio.get_event_loop()
    try:
        package = await loop.run_in_executor(None, generate_campaign, idea)
    except OrchestratorError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to generate campaign: {e}")

    # 2. Build response
    response_data = package.model_dump()

    return response_data

