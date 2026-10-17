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


@app.post("/api/coach/voice-checkin", response_model=VoiceCheckinResponse)
async def voice_checkin(req: VoiceCheckinRequest):
    profile = analyze_user_patterns(req.user_id)

    habit = profile.active_habit
    reply_text = (
        f"Namaste {profile.persona_name} ji! Pichle hafte humne buffer ka target rakha tha. "
        f"Is hafte hum sirf EK simple habit par focus karenge: {habit.title} ({habit.tagline}). "
        f"Kya main aaj ka ₹{habit.suggested_amount_inr:.0f} transfer initiate kar doon?"
    )

    audio_base64 = await synthesize_speech_sarvam(reply_text, req.language_code)

    return VoiceCheckinResponse(
        transcription=req.text_prompt or "Namaste Coach, pichle hafte ka kya update hai?",
        coach_reply_text=reply_text,
        coach_reply_audio_base64=audio_base64,
        updated_profile=profile,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
