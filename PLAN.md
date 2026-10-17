# 🪙 Financial Habit Coach (Bachatt Mitra / Gullak)
## Agentic Voice AI for Autonomous Behavioral Finance
> **Fintech × Voice AI Buildathon | Bachatt × Digia**  
> **Concept**: *Checks in, remembers last week, and nudges one habit at a time.*  
> **Category**: Wealth & Behavioral Finance · **Level 3 · Wild**  
> **Voice Engine**: **Dograh** (Open-Source Voice Agent Orchestration & Real-Time Media Pipeline)  
> **Mobile Client**: **React Native / Expo** (Native Audio Streaming, Haptics & Habit HUD)  
> **Target Progression**: Level 2 (Intelligence & Financial Pattern Detection) by Lunch $\rightarrow$ Level 3 (Autonomous Agentic Voice Coach with Dograh Real-time Pipeline, Longitudinal Memory & One-Tap Financial Actions in React Native) by 3:00 PM.

---

## 1. Project Overview & Hackathon Positioning

Most financial apps fail because they dump complex transaction charts, expense categorization graphs, and spreadsheet-like dashboards on users who find them stressful or ignore them.

**Financial Habit Coach (Bachatt Mitra)** flips this entirely:
It is an autonomous, voice-first companion inspired by behavioral economics (James Clear's *Atomic Habits* and BJ Fogg's *Tiny Habits*). Built with **Dograh** as the voice orchestration backbone and **React Native** as the mobile client:
1. **Checks In via Dograh Real-Time Voice**: Initiates a warm, conversational 60-second voice check-in in Hindi, Hinglish, or Indian English using Dograh's media pipeline, combining **Sarvam AI** (Saaras STT & Bulbul TTS) and **ElevenLabs** with low latency.
2. **Remembers Last Week**: Uses an **Agentic Longitudinal Memory** to track commitments, broken streaks, past excuses, and emotional spending triggers across multiple sessions.
3. **Nudges ONE Habit at a Time**: Isolates the single highest-leverage micro-habit for the week (e.g., *"Prevent the weekend ₹300 delivery spend"*, *"Protect your ₹45 daily health cover mandate from failing due to zero balance"*, or *"Lock in a ₹50 daily micro-SIP streak"*).
4. **Takes Autonomous Action in React Native**: When the user agrees (*"Haan, ₹50 bacha lo"*), Dograh executes the tool call (`execute_micro_save()`), instantly triggering native haptics, celebratory animations, and updating the mobile streak counter.

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
| **Performance Measure (P)** | Habit streak continuity (days maintained), Micro-savings volume initiated (₹), Reduction in failed auto-debit alerts (SMS INSUFFICIENT FUNDS $\rightarrow$ 0), Voice turn latency (< 900ms via Dograh streaming), Habit compliance rate against last week's commitment. |
| **Environment (E)** | User mobile device (React Native client with microphone & audio output), Dograh self-hosted voice pipeline, Micro-fintech database (SMS stream, Bank UPI feeds, Daily SIP orders, Insurance mandates, Loan EMIs), Indian vernacular socio-economic context (Hinglish/Hindi daily wage & salaried micro-savers). |
| **Actuators (A)** | Dograh synthesized voice stream (Sarvam Bulbul / ElevenLabs), React Native UI animations (Glowing Orb, Habit Card, Native Haptics), Autonomous tool execution (`execute_micro_save()`, `resume_sip()`, `schedule_habit_checkin()`), WhatsApp habit digest dispatch. |
| **Sensors / Percepts (S)** | Mobile microphone audio stream (Dograh WebRTC / WebSocket input), Transactional SMS events (`sms.csv`), Daily SIP order states (`sip_plans.csv`), Policy payment failures (`mandates.csv`, `receivables.csv`). |

---

## 4. Multi-Agent & Dograh System Architecture

```
                  ┌─────────────────────────────────────────┐
                  │       React Native Mobile App           │
                  │   (Expo / Reanimated / Native Haptics)  │
                  │   [🎤 Voice Stream]   [🔥 Habit Streak]  │
                  └────────────────────┬────────────────────┘
                                       │
                       WebRTC / WebSocket Audio Stream
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    DOGRAH VOICE AGENT ORCHESTRATION PIPELINE                    │
│                        (github.com/dograh / dograh.com)                         │
│                                                                                 │
│   ┌──────────────────────────────┐       ┌──────────────────────────────────┐   │
│   │   Dograh Real-Time Media     │       │   Dograh Voice Workflow Graph    │   │
│   │   • WebRTC audio session     │       │   • Turn Detection & VAD         │   │
│   │   • Sarvam Saaras STT        │       │   • Prompt injection (Memory)    │   │
│   │   • ElevenLabs / Bulbul TTS  │       │   • MCP Tool Dispatcher          │   │
│   └──────────────┬───────────────┘       └────────────────┬─────────────────┘   │
└──────────────────┼────────────────────────────────────────┼─────────────────────┘
                   │                                        │
                   ▼ Tool Calls & Memory Sync               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                BACKEND & INTELLIGENCE CORE (FastAPI + SQLite)                   │
│                                                                                 │
│  ┌────────────────────────┐  Shared State & SQLite     ┌─────────────────────┐  │
│  │   Pattern Analyzer     │◄──────────────────────────►│  Longitudinal Memory│  │
│  │   (SMS Leaks & Debits) │                            │  (Commitment Store) │  │
│  └───────────┬────────────┘                            └──────────┬──────────┘  │
│              │                                                    │             │
│              ▼                                                    ▼             │
│  ┌────────────────────────┐                            ┌─────────────────────┐  │
│  │  Autonomous Action     │                            │  Mobile Sync Engine │  │
│  │  Tools (Save/Resume)   │                            │  (Push & Streaks)   │  │
│  └────────────────────────┘                            └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Dograh Voice Integration Details

**Why Dograh is the game-changer for this architecture**:
- **Open-Source & Self-Hostable**: Unlike closed blackbox platforms (Vapi/Retell), Dograh runs on top of production media pipelines (Pipecat) with complete transparency.
- **BYOK Multi-Model Flexibility**: Mixes **Sarvam AI** (for superior Indian vernacular Hinglish/Hindi speech recognition) with **OpenAI GPT-4o** for reasoning, and **ElevenLabs** for ultra-natural streaming voice playback.
- **MCP-Native Tool Calling**: Dograh connects directly to our backend tool server via Model Context Protocol (MCP) or JSON tool schemas:
  - `get_last_week_commitment(user_id)`
  - `get_active_habit(user_id)`
  - `execute_micro_save(user_id, amount_inr)`
- **Interruption Handling & Turn Taking**: Dograh’s native Voice Activity Detection (VAD) allows the user to interrupt naturally (*"Arre nahi, Swiggy nahi tha!"*) without cutting off the session.

---

## 6. React Native Mobile Client Details

The user interface is engineered natively in **React Native** (using Expo for rapid hackathon iteration):
1. **The Breathing Voice Orb (`components/CoachOrb.tsx`)**:
   - Built with React Native Reanimated to pulse gently during idle state, expand on user speech, and ripple during Dograh's voice output.
2. **The "One Habit at a Time" Card (`components/SingleHabitCard.tsx`)**:
   - Distraction-free mobile card with large typography.
   - Streak counter with fire animation and native haptic feedback (`expo-haptics`) upon completion.
3. **The Memory Timeline (`components/MemoryTimeline.tsx`)**:
   - Visual comparison: What was promised last Tuesday vs actual bank SMS evidence.
4. **Action Deck & Confetti**:
   - Instant approval button: `[Save ₹50 Now]`. Triggers confetti burst and haptic vibration.

---

## 7. Concurrent 2-Member Division of Labor (Zero Conflicts)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                             API CONTRACT & SHARED DTOs                        │
│             (/backend/schemas.py  &  /mobile/src/types/coach.ts)              │
│                                                                               │
│  Member 1 Branch: `feat/backend-dograh-voice`│ Member 2 Branch: `feat/mobile-rn-ui`       │
└───────────────────────────────────────────────┴───────────────────────────────┘
```

### Member 1: Backend Intelligence, Dograh Pipeline & Longitudinal Memory
- **Responsibilities**:
  1. **SQLite Database**: Ingest `sms.csv`, `sip_plans.csv`, and `mandates.csv`.
  2. **Level 2 Pattern Engine**: Detects cash leaks, failed debits, and computes the 1–100 habit resilience score.
  3. **Dograh Voice Workflow Configuration**:
     - Configures the Dograh voice agent graph with Sarvam STT, OpenAI prompt, and ElevenLabs TTS.
     - Registers MCP / function tools: `execute_micro_save()`, `get_habit_status()`.
  4. **Longitudinal Memory Store**: Persists commitments and weekly reflections in `backend/data/memory/`.

### Member 2: React Native Mobile App & Interactive Habit Studio
- **Responsibilities**:
  1. **React Native / Expo Mobile App**: Scaffold mobile project using pnpm workspace (`mobile/`).
  2. **Voice Audio Client**: Connects microphone stream to Dograh via WebSocket / WebRTC.
  3. **Mobile UI Components**:
     - Reanimated Coach Orb (reactive visual voice feedback).
     - Single Habit Focus Card with streak counter and progress bar.
     - Memory Timeline reflecting last week's bank SMS.
  4. **Haptics & Celebrations**: Integrates `expo-haptics` for tactile confirmation when habits are completed.

---

## 8. Implementation Milestones & Timeline (Hackathon Clock)

```
Time         Milestone               Deliverables                                    Level Status
─────────────────────────────────────────────────────────────────────────────────────────────────
1:40 - 2:15  Data & L2 Intelligence Ingested SMS & SIP data into SQLite.            Level 2 (Ready)
              (Member 1)             Working pattern detector: finds leaks, failed
                                     mandates, and broken streaks.

1:40 - 2:15  React Native Shell     React Native / Expo app initialized with        Level 1 (Done)
              (Member 2)             Single Habit Card, Streak HUD & Reanimated Orb.

2:15 - 2:40   LUNCH DEMO / QUALIFY   Demonstrate Level 2 Intelligence:               LEVEL 2 QUALIFIED!
                                     Input User ID -> Instant detection of failed
                                     mandates, leak patterns & habit recommendation.

2:40 - 3:15   Dograh + Mobile Voice  Dograh real-time voice pipeline connected       Level 3 (Partial)
                                     to React Native client; audio streaming live.

3:15 - 3:45   Agentic Action Loop    "Haan ₹50 save kardo" -> Dograh agent triggers  LEVEL 3 COMPLETE!
                                     `execute_micro_save()`, React Native vibrates,
                                     streak increments, and confirmation plays.

3:45 - 4:15   Final Polish & Demo    Record 2-minute mobile screen recording with
                                     live voice dialogue for judges.
```

---

## 9. Definition of Done & Qualification Checklist

### Level 2 Qualification (By Lunch)
- [ ] SQLite database created from `data/sms/sms.csv`, `data/investment/sip_plans.csv`, and `data/insurance/mandates.csv`.
- [ ] Backend endpoint `/api/coach/profile/:userId` returning:
  - Monthly cash leakage patterns (e.g. food delivery, failed debits).
  - Single highest-leverage habit recommendation.
- [ ] React Native app displays user habit profile, streak status, and last week's recap.

### Level 3 Agentic Delivery (By 3:00 PM)
- [ ] Real-time bidirectional voice conversation operating via Dograh (Sarvam AI / ElevenLabs).
- [ ] Longitudinal memory module persisting commitments and outcomes across check-in sessions.
- [ ] Autonomous tool invocation: Voice agreement triggers real transaction state change (`execute_micro_save()`).
- [ ] React Native client provides tactile haptic feedback and streak celebration animations.
