/**
 * TypeScript Interface Contract matching backend/schemas.py
 * Production Grade Financial Habit Coach Domain
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
  action_type: 'MICRO_SAVE' | 'RESUME_SIP' | 'BALANCE_BUFFER' | 'MANDATE_PROTECTION' | 'SIP_RESUME' | string;
  suggested_amount_inr: number;
}

export interface DemoPersona {
  user_id: string;
  display_name: string;
}

export interface Level1Explainer {
  statement_summary: string;
  score_breakdown: string[];
  score_advice: string;
  policy_summary: string;
}

export interface RecurringLeak {
  category: string;
  merchant: string;
  frequency: string;
  est_monthly_inr: number;
}

export interface CashflowDay {
  date: string;
  day_name: string;
  projected_inflow_inr: number;
  projected_outflow_inr: number;
  status: 'SAFE' | 'AT_RISK' | 'DANGER' | string;
  note?: string;
}

export interface Level2Intelligence {
  cashflow_forecast: CashflowDay[];
  forecast_warning?: string;
  detected_leaks: RecurringLeak[];
  recommended_action: string;
}

export interface TransactionItem {
  id: string;
  sender: string;
  merchant: string;
  amount_inr: number;
  date: string;
  is_failure: boolean;
  snippet: string;
}

export interface FinancialMetrics {
  total_sms_analyzed: number;
  total_discretionary_spend_inr: number;
  failed_debits_count: number;
  mandates_at_risk_count: number;
  active_streak_days: number;
  total_saved_inr: number;
}

export interface UserHabitProfile {
  user_id: string;
  persona_name: string;
  habit_resilience_score: number;
  top_vulnerability: string;
  metrics: FinancialMetrics;
  recent_transactions: TransactionItem[];
  level1?: Level1Explainer;
  level2?: Level2Intelligence;
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
