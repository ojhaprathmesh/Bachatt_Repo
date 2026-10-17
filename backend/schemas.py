"""
Shared Data Transfer Objects (DTOs) and Schemas for Bachatt Financial Habit Coach.
Contract shared between Backend (Member 1) and Frontend (Member 2).
"""

from typing import Optional

from pydantic import BaseModel, Field


class HabitCommitment(BaseModel):
    commitment_id: str
    week_number: int
    date: str
    target_description: str
    outcome: str = "IN_PROGRESS"  # "ACHIEVED", "BROKEN", "IN_PROGRESS"
    evidence_snippet: Optional[str] = None
    reflection: Optional[str] = None


class ActiveHabit(BaseModel):
    habit_id: str
    title: str
    tagline: str
    rationale: str
    current_streak_days: int = 0
    best_streak_days: int = 0
    money_protected_inr: float = 0.0
    action_type: str = "MICRO_SAVE"  # "MICRO_SAVE", "RESUME_SIP", "BALANCE_BUFFER"
    suggested_amount_inr: float = 50.0


class UserHabitProfile(BaseModel):
    user_id: str
    persona_name: str
    habit_resilience_score: int = Field(ge=0, le=100)
    top_vulnerability: str
    active_habit: ActiveHabit
    last_week_commitment: Optional[HabitCommitment] = None


class ActionTriggerRequest(BaseModel):
    user_id: str
    action_type: str
    amount_inr: Optional[float] = 50.0
    habit_id: Optional[str] = None


class ActionTriggerResponse(BaseModel):
    success: bool
    transaction_id: str
    message: str
    updated_streak_days: int
    total_saved_inr: float


class VoiceCheckinRequest(BaseModel):
    user_id: str
    audio_base64: Optional[str] = None
    text_prompt: Optional[str] = None
    language_code: str = "hi-IN"


class VoiceCheckinResponse(BaseModel):
    transcription: str
    coach_reply_text: str
    coach_reply_audio_base64: Optional[str] = None
    detected_action: Optional[ActionTriggerRequest] = None
    updated_profile: UserHabitProfile
