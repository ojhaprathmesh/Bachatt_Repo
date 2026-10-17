/**
 * TypeScript Interface Contract matching backend/schemas.py
 * Member 2 Domain.
 */

export interface HabitCommitment {
  commitment_id: string;
  week_number: number;
  date: string;
  target_description: string;
  outcome: 'ACHIEVED' | 'BROKEN' | 'IN_PROGRESS';
  evidence_snippet?: string;
  reflection?: string;
}

export interface ActiveHabit {
  habit_id: string;
  title: string;
  tagline: string;
  rationale: string;
  current_streak_days: number;
  best_streak_days: number;
  money_protected_inr: number;
  action_type: 'MICRO_SAVE' | 'RESUME_SIP' | 'BALANCE_BUFFER';
  suggested_amount_inr: number;
}

export interface UserHabitProfile {
  user_id: string;
  persona_name: string;
  habit_resilience_score: number;
  top_vulnerability: string;
  active_habit: ActiveHabit;
  last_week_commitment?: HabitCommitment;
}

export interface ActionTriggerResponse {
  success: boolean;
  transaction_id: string;
  message: string;
  updated_streak_days: number;
  total_saved_inr: number;
}
