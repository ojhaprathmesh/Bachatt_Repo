"""
FastAPI Server: Core API Gateway for Financial Habit Coach.
Exposes endpoints for Profile, Pattern Analysis, Voice Check-in, and Autonomous Actions.
"""

import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.memory.longitudinal_store import get_user_memory, update_user_memory
from backend.schemas import (
    ActionTriggerRequest,
    ActionTriggerResponse,
    UserHabitProfile,
    VoiceCheckinRequest,
    VoiceCheckinResponse,
)
from backend.services.analyzer import analyze_user_patterns
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


@app.post("/api/coach/execute-action", response_model=ActionTriggerResponse)
def execute_action(req: ActionTriggerRequest):
    mem = get_user_memory(req.user_id)
    new_streak = mem.get("streak_days", 0) + 1
    amount = req.amount_inr or 50.0
    updated_mem = update_user_memory(req.user_id, new_streak, amount)

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

    reply_text = (
        f"Namaste {profile.persona_name} ji! Pichle hafte humne EMI buffer ka target rakha tha, "
        f"lekin Saturday ko debit bounce hua. Is hafte hum sirf EK simple habit par focus karenge: "
        f"Roz subah ₹50 apne Smart Reserve mein alag kar dein. Kya main aaj ka ₹50 transfer initiate kar doon?"
    )

    audio_base64 = await synthesize_speech_sarvam(reply_text, req.language_code)

    return VoiceCheckinResponse(
        transcription="Namaste Coach, pichle hafte ka kya update hai?",
        coach_reply_text=reply_text,
        coach_reply_audio_base64=audio_base64,
        updated_profile=profile,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
