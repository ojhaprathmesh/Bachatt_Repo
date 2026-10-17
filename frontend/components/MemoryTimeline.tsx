import React from 'react';
import { History, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { HabitCommitment } from '../types/coach';

interface MemoryTimelineProps {
  commitment?: HabitCommitment;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ commitment }) => {
  if (!commitment) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
        <History className="w-4 h-4 text-indigo-400" />
        Coach Remembers Last Week (Week {commitment.week_number})
      </div>

      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-medium text-slate-200">
            "{commitment.target_description}"
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            Bounced
          </span>
        </div>

        {commitment.evidence_snippet && (
          <div className="text-xs font-mono bg-slate-950/60 text-slate-400 p-2.5 rounded-lg border border-slate-800/80 mb-2">
            SMS: {commitment.evidence_snippet}
          </div>
        )}

        {commitment.reflection && (
          <p className="text-xs text-amber-300/80 italic">
            Coach note: {commitment.reflection}
          </p>
        )}
      </div>
    </div>
  );
};
