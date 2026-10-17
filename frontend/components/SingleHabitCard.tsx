import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';
import { ActiveHabit } from '../types/coach';

interface SingleHabitCardProps {
  habit: ActiveHabit;
  onActionClick: () => void;
  loading?: boolean;
}

export const SingleHabitCard: React.FC<SingleHabitCardProps> = ({ habit, onActionClick, loading }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          This Week's Single Focus
        </span>
        <div className="flex items-center gap-1 text-amber-400 font-bold text-sm bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
          <Flame className="w-4 h-4 fill-amber-400" />
          {habit.current_streak_days} Day Streak
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-1">{habit.title}</h2>
      <p className="text-sm text-slate-400 mb-4">{habit.tagline}</p>

      <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-700/50">
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Why this matters:</strong> {habit.rationale}
        </p>
      </div>

      {/* Weekly Consistency Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Weekly Consistency Goal</span>
          <span className="text-emerald-400 font-bold">{habit.current_streak_days} / 7 days</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(12, Math.round((habit.current_streak_days / 7) * 100)))}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div>
          <div className="text-xs text-slate-400">Protected so far</div>
          <div className="text-lg font-bold text-emerald-400">₹{habit.money_protected_inr}</div>
        </div>
        <button
          onClick={onActionClick}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Moving...' : `Save ₹${habit.suggested_amount_inr} Now`}
        </button>
      </div>
    </div>
  );
};
