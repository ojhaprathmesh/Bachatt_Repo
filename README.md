# 🪙 Financial Habit Coach (Bachatt Mitra)
> **Voice AI × Fintech Buildathon | Bachatt × Digia**  
> *Checks in, remembers last week, and nudges one habit at a time.*  
> **Category**: Wealth & Behavioral Finance · **Level 3 · Wild**

---

## 🚀 Quickstart with pnpm Workspace & uv

### 1. Root & Monorepo Setup (pnpm)
```bash
# Install all workspace dependencies
pnpm install

# Run frontend via workspace
pnpm dev

# Typecheck and lint frontend
pnpm typecheck
pnpm lint
pnpm build
```

### 2. Backend & Python Setup (uv & ruff)
```bash
# Environment setup
cp .env.example .env

# Using uv (lightning fast Python package runner)
uv venv
source .venv/bin/activate
uv pip install -r backend/requirements.txt

# Lint and check python errors with ruff
ruff check .
ruff format --check .

# Ingest hackathon data (sms.csv, sip_plans.csv, mandates.csv)
python -m backend.db.loader

# Run FastAPI Server (port 8000)
python -m backend.server
```

---

## 🏛️ Architecture & Division of Work
- See full architecture, PEAS specifications, and multi-agent designs in **[PLAN.md](PLAN.md)**.
