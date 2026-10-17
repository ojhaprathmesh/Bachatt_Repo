# 🪙 Financial Habit Coach (Bachatt Mitra / Gullak)
## Agentic Voice AI for Autonomous Behavioral Finance
> **Fintech × Voice AI Buildathon | Bachatt × Digia**  
> **Concept**: *Checks in, remembers last week, and nudges one habit at a time.*  
> **Category**: Wealth & Behavioral Finance · **Level 3 · Wild**  
> **Target Progression**: Level 2 (Intelligence & Financial Pattern Detection) by Lunch $\rightarrow$ Level 3 (Autonomous Agentic Voice Coach with Longitudinal Memory & One-Click Financial Actions) by 3:00 PM.

---

## 1. Project Overview & Hackathon Positioning

Most financial apps fail because they dump complex transaction charts, expense categorization graphs, and spreadsheet-like dashboards on users who find them stressful or ignore them.

**Financial Habit Coach (Bachatt Mitra)** flips this entirely:
It is an autonomous, voice-first companion inspired by behavioral economics (James Clear's *Atomic Habits* and BJ Fogg's *Tiny Habits*). Instead of overwhelming the user with their entire balance sheet, it:
1. **Checks In via Voice**: Initiates a warm, conversational 60-second voice check-in (Hindi, Hinglish, or Indian English via **Sarvam AI** and **ElevenLabs**).
2. **Remembers Last Week**: Uses an **Agentic Longitudinal Memory** to track commitments, broken streaks, past excuses, and emotional spending triggers across multiple sessions.
3. **Nudges ONE Habit at a Time**: Isolates the single highest-leverage micro-habit for the week (e.g., *"Prevent the weekend ₹300 delivery spend"*, *"Protect your ₹45 daily health cover mandate from failing due to zero balance"*, or *"Lock in a ₹50 daily micro-SIP streak"*).
4. **Takes Autonomous Action**: When the user agrees (*"Haan, ₹50 bacha lo"*), the agent autonomously triggers the action (e.g., micro-saving deposit, resuming a paused SIP, setting up a balance safety alert).

---

## 2. In-Depth Hackathon Data Analysis

The Bachatt repository contains multi-dimensional financial behavior logs across 1,550+ users:
- **`data/sms/sms.csv` (53,962 messages)**: Bank debit alerts (Canara, Kotak, HDFC), UPI spends, Swiggy/Zomato/Amazon deliveries, failed transactions due to `INSUFFICIENT FUNDS`, lottery promotions, and salary credits.
- **`data/investment/sip_plans.csv` & `orders.csv` (6,248 plans)**: Daily micro-SIPs (`SMART_DEPOSIT` ₹101 daily), monthly mutual funds (₹1001), pause dates (`paused_at`), and user cancellation reasons (`USER_CANCELLED`, `MODIFIED`).
- **`data/insurance/mandates.csv`, `policies.csv`, `receivables.csv`**: Daily micro-insurance premiums (₹21 or ₹45/day) that lapse when UPI autopay fails, creating unpaid receivables and blocking cover.
- **`data/loan/emis.csv` & `payments.csv`**: Loan EMI schedules, overdue penalties, and settlement records.

### 2.1 Behavioral Patterns Discovered in Data
1. **The "Micro-Leakage" Phenomenon**:
   - Users maintain active daily ₹101 Smart Deposits, but cancel them within 6–10 days because of small discretionary debits (Swiggy, Amazon Pay recharges).
2. **The "Mandate Domino" Crash**:
   - An account dropping below ₹50 causes the ₹45 Care Health daily premium mandate to bounce (`insufficient_funds` in SMS), cancelling health insurance for a family of three and barring future purchases (`insurance_eligibility_blocks.csv`).
3. **The Single-Habit Solution**:
   - Fixing just **one** behavior—e.g., maintaining a ₹200 buffer before the 7th of every month, or auto-routing ₹50 from daily spare cash into a liquid basket—prevents loan defaults, preserves insurance, and builds compound savings.

---

## 3. PEAS Specification

| Component | Specification for Financial Habit Coach |
| :--- | :--- |
| **Performance Measure (P)** | Habit streak continuity (days maintained), Micro-savings volume initiated (₹), Reduction in failed auto-debit alerts (SMS INSUFFICIENT FUNDS $\rightarrow$ 0), Voice turn latency (< 1.2s TTFB), Habit compliance rate against last week's commitment. |
| **Environment (E)** | User financial lifecycle (SMS stream, Bank UPI feeds, Daily SIP orders, Insurance mandates, Loan EMIs), Indian vernacular socio-economic context (Hinglish/Hindi daily wage & salaried micro-savers). |
| **Actuators (A)** | Spoken voice dialogue (Sarvam / ElevenLabs audio), Dynamic "One Habit" interactive HUD card, Autonomous tool execution (`execute_micro_save()`, `resume_sip()`, `schedule_habit_checkin()`), WhatsApp habit digest dispatch. |
| **Sensors / Percepts (S)** | Voice utterances (microphone stream via Sarvam Saaras STT), Transactional SMS events (`sms.csv`), Daily SIP order states (`sip_plans.csv`), Policy payment failures (`mandates.csv`, `receivables.csv`). |

---

## 4. Multi-Agent System Architecture

```
                  ┌─────────────────────────────────────────┐
                  │    User Interface (Web / Mobile PWA)    │
                  │   [🎤 Voice Check-In]  [🔥 Habit Streak] │
                  └────────────────────┬────────────────────┘
                                       │
                         Bidirectional Audio / REST
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ORCHESTRATION & GATEWAY LAYER                          │
│                                                                                 │
│   ┌──────────────────────────────┐       ┌──────────────────────────────────┐   │
│   │   Sarvam AI Voice Gateway    │       │   ElevenLabs Streaming Gateway   │   │
│   │   • Saaras Hindi/Hinglish STT│       │   • Ultra-low latency English/   │   │
│   │   • Bulbul v1 Expressive TTS │       │     conversational voice turns   │   │
│   └──────────────┬───────────────┘       └────────────────┬─────────────────┘   │
└──────────────────┼────────────────────────────────────────┼─────────────────────┘
                   │                                        │
                   ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT CORE (Google ADK / LangGraph)                    │
│                                                                                 │
│  ┌────────────────────────┐  Shared Blackboard State   ┌─────────────────────┐  │
│  │   Coach Master Agent   │◄──────────────────────────►│   Pattern Discovery │  │
│  │   (Empathy & Dialogue) │                            │   & Intelligence    │  │
│  └───────────┬────────────┘                            └──────────┬──────────┘  │
│              │                                                    │             │
│              ▼                                                    ▼             │
│  ┌────────────────────────┐                            ┌─────────────────────┐  │
│  │  Longitudinal Memory   │                            │   Action & Habit    │  │
│  │  Agent (Remembers Week)│                            │   Execution Agent   │  │
│  │  • Commitments log     │                            │   • Trigger ₹50 save│  │
│  │  • Habit streaks & delta│                            │   • Auto-unpause SIP│  │
│  └────────────────────────┘                            └─────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ Tool Calls / SQL
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   DATA & TOOL LAYER (FastAPI + SQLite Engine)                   │
│                                                                                 │
│  • analyze_user_spends(user_id)          • get_habit_streak(user_id)             │
│  • get_last_week_commitment(user_id)     • execute_micro_deposit(user_id, amt)   │
│  • detect_impulse_leaks(sms_records)     • resume_paused_sip(sip_plan_id)        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Agentic Longitudinal Memory Model (How It "Remembers Last Week")

The agent does not operate as a stateless chatbot. It maintains a dual-layer memory:

### 5.1 Session Memory (Short-Term Blackboard)
```json
{
  "session_id": "sess_chk_108",
  "active_habit": "Weekend ₹300 Food Delivery Shield",
  "mood_sentiment": "stressed_about_emi",
  "current_turn": 3,
  "pending_action": "confirm_micro_save_50"
}
```

### 5.2 Longitudinal Memory (Long-Term Behavioral Profile)
```json
{
  "user_id": "1751385702744480",
  "persona_name": "Ramesh",
  "primary_vulnerability": "Late-night weekend UPI food debits causing low balance on Monday",
  "streak_history": {
    "current_streak_days": 4,
    "best_streak_days": 12,
    "last_broken_reason": "Swiggy order of ₹380 on 07-Oct"
  },
  "last_week_commitment": {
    "date": "2026-10-07",
    "target": "Keep account balance above ₹100 so ₹45 health insurance mandate does not fail",
    "outcome": "FAILED — Canara Bank SMS: Txn of Rs.45 failed due to INSUFFICIENT FUNDS"
  },
  "this_week_focus_habit": {
    "habit_id": "HABIT_MICRO_SAVE_50",
    "title": "₹50 Daily Morning Auto-Shield",
    "rationale": "Auto-saves ₹50 into Smart Deposit before discretionary evening spends occur",
    "agreed_by_user": true
  }
}
```

When Ramesh speaks to the coach this morning, the agent references this exact memory:
> *"Ramesh ji, last week humne plan kiya tha ki Canara account mein ₹100 maintain karenge taaki family ka health insurance premium na ruke. Par Saturday ko account low hone ki wajah se ₹45 ka debit fail ho gaya. Koi baat nahi! Is hafte hum sirf EK simple habit par focus karenge: Subah subah ₹50 apne Smart Deposit mein save kar lein, shaam ko kharch hone se pehle. Kya main aaj ka ₹50 transfer initiate kar doon?"*

---

## 6. Concurrent 2-Member Division of Labor (Zero Conflicts)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                             API CONTRACT & SHARED DTOs                        │
│                (/backend/schemas.py  &  /frontend/types/coach.ts)             │
│                                                                               │
│  Member 1 Branch: `feat/backend-coach-voice` │ Member 2 Branch: `feat/frontend-habit-ui` │
└───────────────────────────────────────────────┴───────────────────────────────┘
```

### Member 1: Backend Intelligence, Longitudinal Memory & Voice Core
- **Responsibilities**:
  1. **SQLite Ingestion Pipeline**: Ingest `sms.csv`, `sip_plans.csv`, `mandates.csv`, and `emis.csv` into a queryable local SQLite store.
  2. **Level 2 Pattern Intelligence (`backend/services/analyzer.py`)**:
     - `detect_habit_patterns(user_id)`: Flags recurring leaks (e.g. food apps, gaming, unpaid mandates).
     - `calculate_habit_score(user_id)`: Computes a 1–100 financial habit resilience score.
  3. **Longitudinal Memory Engine (`backend/memory/coach_memory.py`)**:
     - Reads/writes past commitments, streak counts, and behavioral reflections into `data/memory/user_{id}.json`.
  4. **Voice Agent Engine (`backend/services/voice_coach.py`)**:
     - Connects Sarvam AI for natural Hindi/Hinglish speech and ElevenLabs streaming.
     - Implements autonomous action tools: `execute_micro_save(amt)`, `resume_sip(sip_id)`, `set_weekly_commitment(target)`.

### Member 2: Frontend Habit Studio, Voice Stream HUD & Interactive Nudge UI
- **Responsibilities**:
  1. **Voice Coach Avatar & Live HUD (`frontend/components/CoachOrb.tsx`)**:
     - Pulsing, glowing conversational orb reacting to agent speech and user mic input.
     - Real-time live audio transcription and response stream.
  2. **"One Habit at a Time" Card (`frontend/components/SingleHabitCard.tsx`)**:
     - Clean, focused interface highlighting *only the current single habit* (no visual clutter).
     - Streak counter (🔥 4 Days Active), visual impact meter (*"₹350 protected this week"*).
  3. **"Remember Last Week" Memory Timeline (`frontend/components/MemoryTimeline.tsx`)**:
     - Visual side-by-side: *What you promised last Tuesday* vs *What happened*.
     - Shows relevant bank SMS snippet confirming the event.
  4. **Instant Action Deck (`frontend/components/NudgeActionDeck.tsx`)**:
     - Interactive one-tap button: `[Save ₹50 Now]`, `[Auto-Fix Insurance Mandate]`.
     - Triggers backend action tool seamlessly with celebration micro-animation (confetti / streak level up).

---

## 7. Implementation Milestones & Timeline (Hackathon Clock)

```
Time         Milestone               Deliverables                                    Level Status
─────────────────────────────────────────────────────────────────────────────────────────────────
12:55 - 1:25  Data & L2 Intelligence Ingested SMS & SIP data into SQLite.            Level 2 (Ready)
              (Member 1)             Working pattern detector: finds leaks, failed
                                     mandates, and broken streaks.

12:55 - 1:25  Habit UI & Coach Orb   Single Habit Focus Card, Streak counter, and    Level 1 (Done)
              (Member 2)             Memory Timeline wired with clean mock state.

1:25 - 2:00   LUNCH DEMO / QUALIFY   Demonstrate Level 2 Intelligence:               LEVEL 2 QUALIFIED!
                                     Input User ID -> Instant detection of failed
                                     mandates, leak patterns & habit recommendation.

2:00 - 2:45   Voice + Memory Loop    Sarvam/ElevenLabs voice agent check-in live;    Level 3 (Partial)
                                     Longitudinal memory stores & recalls last week.

2:45 - 3:15   Autonomous Action Loop "Haan ₹50 save kardo" -> Agent triggers         LEVEL 3 COMPLETE!
                                     `execute_micro_save()`, increments streak,
                                     updates UI in real time.

3:15 - 3:45   Final Polish & Demo    Record 2-minute judge walkthrough video;
                                     verify edge cases across 3 diverse user profiles.
```

---

## 8. Concrete Demo Scenario: "Ramesh's Morning Check-In"

- **Customer Profile**: Ramesh (User `1751385702744480` from `sms.csv` & `sip_plans.csv`).
- **Data Reality**:
  - Cancelled his ₹101 daily Smart Deposit on 21-Jul.
  - On 07-Oct, Canara Bank SMS alerts: *"txn of Rs.950 to RINGCAPITAL failed due to INSUFFICIENT FUNDS"*.
  - Discretionary spends on AmazonPay and recharges throughout the week.
- **The 90-Second Live Interaction**:
  1. **Coach Voice Check-in**:
     - Coach: *"Namaste Ramesh ji! Aaj subah ka check-in. Pichle hafte humne discuss kiya tha ki weekend pe extra kharche control karenge taaki Canara account mein EMI ke liye funds rahein. Lekin Saturday ko ₹950 ka auto-debit bounce hua."*
  2. **User Responds by Voice**:
     - Ramesh (via mic): *"Haan yaar, festival shopping mein paise chale gaye the, dhyan nahi raha."*
  3. **Empathetic Nudge to ONE Habit**:
     - Coach: *"Bilkul samajh sakta hoon. Isi liye hum sab kuch ek saath nahi badlenge. Is hafte hum sirf EK choti habit banayenge: Roz subah bas ₹50 apne emergency wallet mein separate kar do, shaam ke kharch hone se pehle. Isse agla EMI kabhi bounce nahi hoga."*
  4. **Autonomous Action (Level 3 Agentic)**:
     - Ramesh: *"Theek hai, kar do."*
     - Coach: *[Calls `execute_micro_save(user_id=1751385702744480, amount=50)`]*
     - Coach: *"Done! ₹50 aapke Smart Reserve mein transfer ho gaye hain. Aapka streak ab 🔥 1 Day ho gaya hai. Kal subah phir milte hain!"*
  5. **Visual Confirmation**:
     - UI flips: Streak badge ignites 🔥 1 Day, ₹50 auto-shield badge turns Green, celebratory haptic chime plays.

---

## 9. Definition of Done & Qualification Checklist

### Level 2 Qualification (By Lunch)
- [ ] SQLite database created from `data/sms/sms.csv`, `data/investment/sip_plans.csv`, and `data/insurance/mandates.csv`.
- [ ] Backend endpoint `/api/coach/patterns/:userId` returning:
  - Monthly cash leakage patterns (e.g. food delivery, failed debits).
  - Single highest-leverage habit recommendation.
- [ ] Frontend displays user habit profile, streak status, and last week's recap.

### Level 3 Agentic Delivery (By 3:00 PM)
- [ ] Bidirectional voice dialogue powered by Sarvam AI (Hindi/Hinglish) and ElevenLabs.
- [ ] Longitudinal memory module persisting commitments and outcomes across check-in sessions.
- [ ] Autonomous tool invocation: Voice agreement triggers real transaction state change (`execute_micro_save()`).
- [ ] Zero Git conflicts between Member 1 (`backend/`) and Member 2 (`frontend/`).
