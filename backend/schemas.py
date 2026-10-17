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


class Level1Explainer(BaseModel):
    statement_summary: str
    score_breakdown: list[str]
    score_advice: str
    policy_summary: str


class RecurringLeak(BaseModel):
    category: str
    merchant: str
    frequency: str
    est_monthly_inr: float


class CashflowDay(BaseModel):
    date: str
    day_name: str
    projected_inflow_inr: float = 0.0
    projected_outflow_inr: float = 0.0
    status: str = "SAFE"  # "SAFE", "AT_RISK", "DANGER"
    note: Optional[str] = None


class Level2Intelligence(BaseModel):
    cashflow_forecast: list[CashflowDay]
    forecast_warning: Optional[str] = None
    detected_leaks: list[RecurringLeak]
    recommended_action: str


class TransactionItem(BaseModel):
    id: str
    sender: str
    merchant: str
    amount_inr: float
    date: str
    is_failure: bool
    snippet: str


class FinancialMetrics(BaseModel):
    total_sms_analyzed: int
    total_discretionary_spend_inr: float
    failed_debits_count: int
    mandates_at_risk_count: int
    active_streak_days: int
    total_saved_inr: float


class UserHabitProfile(BaseModel):
    user_id: str
    persona_name: str
    habit_resilience_score: int = Field(ge=0, le=100)
    top_vulnerability: str
    metrics: FinancialMetrics
    recent_transactions: list[TransactionItem]
    level1: Level1Explainer
    level2: Level2Intelligence
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
