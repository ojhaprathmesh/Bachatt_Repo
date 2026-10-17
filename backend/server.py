"""
FastAPI Server: Core API Gateway for Financial Habit Coach.
Exposes endpoints for Profile, Pattern Analysis, Voice Check-in, and Autonomous Actions.
"""

import sqlite3
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.db.loader import DB_PATH
from backend.memory.longitudinal_store import get_user_memory, update_user_memory
from backend.schemas import (
    ActionTriggerRequest,
    ActionTriggerResponse,
    UserHabitProfile,
    VoiceCheckinRequest,
    VoiceCheckinResponse,
)
from backend.services.analyzer import PERSONA_DIRECTORY, analyze_user_patterns
from backend.services.voice_coach import synthesize_speech_sarvam

app = FastAPI(title="Bachatt Financial Habit Coach API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "Bachatt Financial Habit Coach"}


@app.get("/api/coach/profile/{user_id}", response_model=UserHabitProfile)
def get_coach_profile(user_id: str):
    return analyze_user_patterns(user_id)


@app.get("/api/coach/demo-users", response_model=list[dict])
def get_demo_users():
    """
    Returns curated real user personas from the hackathon dataset for live testing.
    """
    return [
        {
            "user_id": uid,
            "display_name": name,
        }
        for uid, name in PERSONA_DIRECTORY.items()
    ]


@app.post("/api/coach/execute-action", response_model=ActionTriggerResponse)
def execute_action(req: ActionTriggerRequest):
    mem = get_user_memory(req.user_id)
    new_streak = mem.get("streak_days", 0) + 1
    amount = req.amount_inr or 50.0
    updated_mem = update_user_memory(req.user_id, new_streak, amount)

    # Persist action to SQLite audit ledger
    if DB_PATH.exists():
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO habit_ledger (user_id, action_type, amount_inr, notes) VALUES (?, ?, ?, ?)",
                (req.user_id, req.action_type, amount, f"Autonomous action triggered for habit: {req.habit_id or 'auto'}"),
            )
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error logging to habit_ledger: {e}")

    return ActionTriggerResponse(
        success=True,
        transaction_id=f"TXN_{uuid.uuid4().hex[:8].upper()}",
        message=f"₹{amount:.0f} successfully moved to your Smart Reserve. Habit streak incremented!",
        updated_streak_days=new_streak,
        total_saved_inr=updated_mem["total_saved_inr"],
    )


from backend.services.agent import run_autonomous_agent


@app.post("/api/coach/voice-checkin")
async def voice_checkin(req: VoiceCheckinRequest):
    prompt = req.text_prompt or "Namaste Coach, pichle hafte ka kya update hai?"
    res = await run_autonomous_agent(req.user_id, prompt, req.language_code)
    return {
        "transcription": prompt,
        "coach_reply_text": res["agent_reply_text"],
        "coach_reply_audio_base64": res.get("agent_reply_audio_base64"),
        "thought_process": res.get("thought_process"),
        "actions_taken": res.get("actions_taken", []),
        "updated_profile": res["updated_profile"],
    }


@app.post("/api/coach/agent-run")
async def agent_run(payload: dict):
    user_id = payload.get("user_id", "1751385702744480")
    prompt = payload.get("prompt", "Please execute the recommended single habit for me.")
    lang = payload.get("language_code", "hi-IN")
    return await run_autonomous_agent(user_id, prompt, lang)


@app.get("/api/coach/elevenlabs/signed-url")
async def get_elevenlabs_signed_url():
    """
    Returns signed WebSocket URL for ElevenLabs Conversational AI Web SDK.
    """
    import os
    import httpx
    api_key = os.getenv("ELEVENLABS_API_KEY", "")
    agent_id = os.getenv("ELEVENLABS_AGENT_ID", "agent_4501m54njtdkem0aacw0b69ayre4")

    if not api_key:
        return {"error": "ELEVENLABS_API_KEY not configured"}

    headers = {"xi-api-key": api_key}
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id={agent_id}",
            headers=headers,
            timeout=10.0,
        )
        if resp.status_code == 200:
            return resp.json()
        return {"error": f"ElevenLabs API error: {resp.status_code}", "detail": resp.text}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
