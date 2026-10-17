# 🪙 Financial Habit Coach (Bachatt Mitra)
> **Voice AI × Fintech Buildathon | Bachatt × Digia**  
> *Checks in, remembers last week, and nudges one habit at a time.*  
> **Category**: Wealth & Behavioral Finance · **Level 3 · Wild**

---

## 🚀 Quickstart for Team Members

### 1. Environment Setup
Copy the template and fill in your API keys (Sarvam AI, ElevenLabs, OpenAI):
```bash
cp .env.example .env
```

### 2. Backend (Member 1 Domain)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Ingest hackathon data (sms.csv, sip_plans.csv, mandates.csv)
python -m db.loader

# Run FastAPI Server (port 8000)
python server.py
```

### 3. Frontend (Member 2 Domain)
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to interact with the Voice Coach and Single Habit Card.

---

## 🏛️ Architecture & Division of Work
- See full architecture, PEAS specifications, and multi-agent designs in **[PLAN.md](PLAN.md)**.
