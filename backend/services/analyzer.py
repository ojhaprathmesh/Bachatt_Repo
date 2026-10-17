"""
Level 2 Intelligence Engine: Pattern Detection & Habit Profiler.
Analyzes user financial transactions across SMS, SIPs, mandates, and loans.
Discovers micro-leaks, debit failures, and isolates the single weekly habit.
"""

import sqlite3
from typing import Dict

from backend.db.loader import DB_PATH
from backend.memory.longitudinal_store import get_user_memory
from backend.schemas import ActiveHabit, HabitCommitment, UserHabitProfile

PERSONA_DIRECTORY: Dict[str, str] = {
    "1751385702744480": "Ramesh (Discretionary Spender)",
    "1750577443897920": "Sunita (Gig Worker / Mandate Risk)",
    "1750389254784005": "Amit (Micro-SIP Saver)",
    "1748108541385190": "Pooja (Salaried / Buffer Protector)",
    "1753191782285395": "Vikas (Care Health Policyholder)",
    "1752561420691221": "Meera (Daily Wage Saver)",
}


def analyze_user_patterns(user_id: str) -> UserHabitProfile:
    """
    Analyzes user financial behavior from SQLite database.
    Computes habit resilience score and isolates the ONE highest-leverage habit.
    """
    uid_str = str(user_id)
    persona_name = PERSONA_DIRECTORY.get(uid_str, f"User {uid_str[-4:]}")
    mem = get_user_memory(uid_str)
    streak_days = mem.get("streak_days", 3)
    total_saved = mem.get("total_saved_inr", 150.0)

    # Fallback default profile if DB is not initialized
    if not DB_PATH.exists():
        return UserHabitProfile(
            user_id=uid_str,
            persona_name=persona_name,
            habit_resilience_score=68,
            top_vulnerability="Weekend discretionary spends draining account buffer",
            active_habit=ActiveHabit(
                habit_id="HABIT_MORNING_SHIELD_50",
                title="The ₹50 Morning Auto-Shield",
                tagline="Save ₹50 daily before evening discretionary spends",
                rationale="Locks ₹50 into Smart Reserve every morning so weekend debits never bounce.",
                current_streak_days=streak_days,
                best_streak_days=max(streak_days, 7),
                money_protected_inr=total_saved,
                action_type="MICRO_SAVE",
                suggested_amount_inr=50.0,
            ),
            last_week_commitment=HabitCommitment(
                commitment_id=f"comm_{uid_str[:6]}",
                week_number=41,
                date="2026-10-07",
                target_description="Maintain ₹100 buffer in bank account for auto-debit",
                outcome="BROKEN",
                evidence_snippet="Canara Bank: Txn failed due to INSUFFICIENT FUNDS on 07-Oct",
                reflection="Discretionary weekend spends drained minimum balance",
            ),
        )

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Query failed debit SMS
    cur.execute(
        """
        SELECT body_text, received_at_ist FROM sms
        WHERE user_id = ? AND (
            LOWER(body_text) LIKE '%fail%' OR
            LOWER(body_text) LIKE '%insufficient%' OR
            LOWER(body_text) LIKE '%declined%' OR
            LOWER(body_text) LIKE '%bounce%'
        )
        ORDER BY received_at_ist DESC
        LIMIT 10
        """,
        (uid_str,),
    )
    failed_sms = cur.fetchall()
    failed_debits_count = len(failed_sms)

    # 2. Query discretionary leakage SMS (Food delivery, shopping, lottery)
    cur.execute(
        """
        SELECT body_text, received_at_ist FROM sms
        WHERE user_id = ? AND (
            LOWER(body_text) LIKE '%swiggy%' OR
            LOWER(body_text) LIKE '%zomato%' OR
            LOWER(body_text) LIKE '%blinkit%' OR
            LOWER(body_text) LIKE '%zepto%' OR
            LOWER(body_text) LIKE '%amazon%' OR
            LOWER(body_text) LIKE '%lottery%' OR
            LOWER(body_text) LIKE '%rajshree%'
        )
        ORDER BY received_at_ist DESC
        LIMIT 20
        """,
        (uid_str,),
    )
    leakage_sms = cur.fetchall()
    leakage_count = len(leakage_sms)

    # 3. Query Mandates (Care Health insurance & UPI autopay)
    cur.execute(
        """
        SELECT mandate_id, status, authorized_ceiling, failure_reason, created_at, rejected_at
        FROM mandates
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
        """,
        (uid_str,),
    )
    mandates = cur.fetchall()
    rejected_mandates = [m for m in mandates if str(m[1]).lower() in ("rejected", "cancelled", "failed")]

    # 4. Query SIP plans
    cur.execute(
        """
        SELECT sip_plan_id, product, amount_inr, status, cancellation_reason, created_at
        FROM sip_plans
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
        """,
        (uid_str,),
    )
    sip_plans = cur.fetchall()
    cancelled_sips = [s for s in sip_plans if str(s[3]).upper() in ("CANCELLED", "PAUSED")]

    conn.close()

    # 5. Compute Dynamic Habit Resilience Score (0 - 100)
    score = 85
    score -= min(45, failed_debits_count * 15)
    score -= min(30, len(rejected_mandates) * 15)
    score -= min(20, len(cancelled_sips) * 10)
    score -= min(15, leakage_count * 3)
    score = max(18, min(94, score))

    # 6. Dynamically Isolate the Single Highest-Leverage Habit
    if rejected_mandates:
        top_vulnerability = "Care Health daily premium mandate rejected; risk of policy lapse & eligibility block"
        habit_id = "PROTECT_CARE_HEALTH_45"
        title = "Protect ₹45 Daily Health Cover"
        tagline = "Auto-shield ₹45 morning buffer for Care Health mandate"
        rationale = "Prevents daily ₹45 UPI autopay bounce so family health coverage never lapses."
        action_type = "MANDATE_PROTECTION"
        suggested_amount = 45.0
    elif cancelled_sips:
        top_vulnerability = "Daily micro-deposit streak dropped; compound savings momentum broken"
        habit_id = "RESUME_SMART_DEPOSIT_101"
        title = "Lock in ₹101 Daily Smart Deposit"
        tagline = "Resume ₹101 daily micro-SIP into liquid reserve"
        rationale = "Re-activates your daily ₹101 wealth habit with automated morning transfer."
        action_type = "SIP_RESUME"
        suggested_amount = 101.0
    elif failed_sms:
        top_vulnerability = f"{failed_debits_count} debit failure alerts detected due to weekend discretionary spikes"
        habit_id = "HABIT_MORNING_SHIELD_50"
        title = "The ₹50 Morning Auto-Shield"
        tagline = "Save ₹50 daily before evening discretionary spends"
        rationale = "Locks ₹50 into Smart Reserve every morning so weekend account debits never bounce."
        action_type = "MICRO_SAVE"
        suggested_amount = 50.0
    else:
        top_vulnerability = "Unstructured discretionary spends leaking compound micro-savings"
        habit_id = "HABIT_MORNING_SHIELD_50"
        title = "The ₹50 Morning Auto-Shield"
        tagline = "Save ₹50 daily before evening discretionary spends"
        rationale = "Locks ₹50 into Smart Reserve every morning so your financial resilience keeps growing."
        action_type = "MICRO_SAVE"
        suggested_amount = 50.0

    active_habit = ActiveHabit(
        habit_id=habit_id,
        title=title,
        tagline=tagline,
        rationale=rationale,
        current_streak_days=streak_days,
        best_streak_days=max(streak_days, 8),
        money_protected_inr=total_saved,
        action_type=action_type,
        suggested_amount_inr=suggested_amount,
    )

    # 7. Construct Evidence-Backed Last Week Commitment
    if failed_sms:
        latest_fail = failed_sms[0]
        evidence = latest_fail[0].strip()[:140]
        event_date = str(latest_fail[1])[:10] if latest_fail[1] else "2026-10-07"
        target_desc = "Maintain ₹200 buffer in bank account for scheduled debits"
        outcome = "BROKEN"
        reflection = "Discretionary UPI spends over the weekend drained account below the debit threshold"
    elif rejected_mandates:
        rm = rejected_mandates[0]
        evidence = f"Mandate {rm[0]} ({rm[1]}): {rm[3] or 'Request timed out / rejected'}"
        event_date = str(rm[4] or rm[5])[:10] if (rm[4] or rm[5]) else "2026-10-05"
        target_desc = "Keep sufficient account balance for daily Care Health premium mandate"
        outcome = "BROKEN"
        reflection = "Daily autopay mandate failed to execute, triggering coverage risk"
    elif cancelled_sips:
        cs = cancelled_sips[0]
        evidence = f"SIP Plan {cs[0]} ({cs[1]} ₹{cs[2]}) was cancelled: reason {cs[4] or 'USER_CANCELLED'}"
        event_date = str(cs[5])[:10] if cs[5] else "2026-10-06"
        target_desc = "Maintain daily ₹101 micro-deposit streak for 7 consecutive days"
        outcome = "BROKEN"
        reflection = "Temporary liquidity crunch caused streak cancellation"
    else:
        evidence = "No failed bank transactions or mandate rejections found in recent logs."
        event_date = "2026-10-10"
        target_desc = "Keep ₹50 daily micro-savings streak active"
        outcome = "ACHIEVED"
        reflection = "Consistently shielded ₹50 every morning before evening spends"

    last_week = HabitCommitment(
        commitment_id=f"comm_{uid_str[:8]}",
        week_number=41,
        date=event_date,
        target_description=target_desc,
        outcome=outcome,
        evidence_snippet=evidence,
        reflection=reflection,
    )

    return UserHabitProfile(
        user_id=uid_str,
        persona_name=persona_name,
        habit_resilience_score=score,
        top_vulnerability=top_vulnerability,
        active_habit=active_habit,
        last_week_commitment=last_week,
    )
