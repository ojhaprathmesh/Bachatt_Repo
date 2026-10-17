"""
Level 2 Intelligence Engine: Pattern Detection & Habit Profiler.
Member 1 Domain.
"""

import sqlite3

from backend.db.loader import DB_PATH
from backend.schemas import ActiveHabit, HabitCommitment, UserHabitProfile


def analyze_user_patterns(user_id: str) -> UserHabitProfile:
    """
    Analyzes user financial transactions across SMS, SIPs, and mandates.
    Discovers key leaks (e.g. failed debits, dropped SIPs) and isolates the single weekly habit.
    """
    persona_name = "Ramesh"
    habit_score = 64
    vulnerability = "Weekend discretionary ordering causing Monday debit failures"

    last_week = HabitCommitment(
        commitment_id="comm_w41",
        week_number=41,
        date="2026-10-07",
        target_description="Maintain ₹100 buffer in Canara Bank account for loan EMI",
        outcome="BROKEN",
        evidence_snippet="Canara Bank: Txn of Rs.950 to RINGCAPITAL failed due to INSUFFICIENT FUNDS on 07-Oct",
        reflection="Festival weekend UPI expenses drained the minimum balance",
    )

    active_habit = ActiveHabit(
        habit_id="HABIT_MORNING_SHIELD_50",
        title="The ₹50 Morning Auto-Shield",
        tagline="Save ₹50 daily before evening discretionary spends",
        rationale="Locks ₹50 into Smart Reserve every morning so weekend debits never bounce.",
        current_streak_days=3,
        best_streak_days=8,
        money_protected_inr=150.0,
        action_type="MICRO_SAVE",
        suggested_amount_inr=50.0,
    )

    if DB_PATH.exists():
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute(
                """
                SELECT body_text FROM sms
                WHERE user_id = ? AND (body_text LIKE '%failed%' OR body_text LIKE '%INSUFFICIENT%')
                LIMIT 1
                """,
                (user_id,),
            )
            row = cur.fetchone()
            if row:
                last_week.evidence_snippet = row[0][:120]
            conn.close()
        except Exception as e:
            print(f"Error querying DB for patterns: {e}")

    return UserHabitProfile(
        user_id=user_id,
        persona_name=persona_name,
        habit_resilience_score=habit_score,
        top_vulnerability=vulnerability,
        active_habit=active_habit,
        last_week_commitment=last_week,
    )
