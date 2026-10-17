import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CoachOrb } from '../components/CoachOrb';
import { SingleHabitCard } from '../components/SingleHabitCard';
import { MemoryTimeline } from '../components/MemoryTimeline';
import { UserHabitProfile, ActionTriggerResponse } from '../types/coach';

const DEMO_USER_ID = "1751385702744480"; // Ramesh from hackathon data

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserHabitProfile | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachSpeech, setCoachSpeech] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Fetch initial profile
    fetch(`http://localhost:8000/api/coach/profile/${DEMO_USER_ID}`)
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => {
        // Fallback mock
        setProfile({
          user_id: DEMO_USER_ID,
          persona_name: "Ramesh",
          habit_resilience_score: 64,
          top_vulnerability: "Weekend food delivery causing Monday debit failures",
          active_habit: {
            habit_id: "HABIT_MORNING_SHIELD_50",
            title: "The ₹50 Morning Auto-Shield",
            tagline: "Save ₹50 daily before evening discretionary spends",
            rationale: "Locks ₹50 into Smart Reserve every morning so weekend debits never bounce.",
            current_streak_days: 3,
            best_streak_days: 8,
            money_protected_inr: 150.0,
            action_type: "MICRO_SAVE",
            suggested_amount_inr: 50.0
          },
          last_week_commitment: {
            commitment_id: "comm_w41",
            week_number: 41,
            date: "2026-10-07",
            target_description: "Maintain ₹100 buffer in Canara Bank account for loan EMI",
            outcome: "BROKEN",
            evidence_snippet: "Canara Bank: Txn of Rs.950 to RINGCAPITAL failed due to INSUFFICIENT FUNDS on 07-Oct",
            reflection: "Festival weekend UPI expenses drained the minimum balance"
          }
        });
      });
  }, []);

  const handleOrbClick = async () => {
    setIsListening(true);
    setCoachSpeech("Listening to you...");

    // Simulate voice turnaround or call API
    setTimeout(async () => {
      setIsListening(false);
      setIsSpeaking(true);
      const text = `Namaste Ramesh ji! Pichle hafte humne EMI buffer ka target rakha tha, lekin Saturday ko Canara debit bounce hua. Is hafte hum sirf EK simple habit par focus karenge: Roz subah ₹50 apne Smart Reserve mein alag kar dein. Kya main aaj ka ₹50 transfer initiate kar doon?`;
      setCoachSpeech(text);

      setTimeout(() => {
        setIsSpeaking(false);
      }, 5000);
    }, 1500);
  };

  const handleAction = async () => {
    if (!profile) return;
    setActionLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/coach/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.user_id,
          action_type: profile.active_habit.action_type,
          amount_inr: profile.active_habit.suggested_amount_inr
        })
      });
      const data: ActionTriggerResponse = await res.json();
      
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      
      setProfile({
        ...profile,
        active_habit: {
          ...profile.active_habit,
          current_streak_days: data.updated_streak_days,
          money_protected_inr: data.total_saved_inr
        }
      });
      setCoachSpeech(data.message);
    } catch {
      confetti({ particleCount: 50, spread: 50 });
      setProfile({
        ...profile,
        active_habit: {
          ...profile.active_habit,
          current_streak_days: profile.active_habit.current_streak_days + 1,
          money_protected_inr: profile.active_habit.money_protected_inr + 50
        }
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!profile) return <div className="text-white p-10">Loading habit coach...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Bachatt Mitra
          </h1>
          <p className="text-xs text-slate-400">Financial Habit Coach · Level 3 Wild</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">User: {profile.persona_name}</span>
          <div className="text-xs font-semibold text-emerald-400">Score: {profile.habit_resilience_score}/100</div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md flex flex-col gap-6 mt-4">
        {/* Coach Voice Orb */}
        <CoachOrb 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          onClick={handleOrbClick} 
        />

        {coachSpeech && (
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-4 text-sm text-slate-200 shadow-lg animate-in fade-in">
            <span className="text-xs font-bold uppercase text-emerald-400 block mb-1">Coach Dialogue</span>
            {coachSpeech}
          </div>
        )}

        {/* Single Habit Card */}
        <SingleHabitCard 
          habit={profile.active_habit} 
          onActionClick={handleAction} 
          loading={actionLoading} 
        />

        {/* Memory Timeline (Remember Last Week) */}
        <MemoryTimeline commitment={profile.last_week_commitment} />
      </main>
    </div>
  );
};

export default App;
