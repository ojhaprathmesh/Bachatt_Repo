"""
Database Loader: Ingests hackathon CSVs into SQLite for high-speed querying.
Member 1 Domain.
"""

import os
import sqlite3
from pathlib import Path

import pandas as pd

DB_DIR = Path(__file__).resolve().parent.parent / "data"
DB_PATH = DB_DIR / "bachatt_coach.db"
RAW_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Ingest SMS table
    sms_csv = RAW_DATA_DIR / "sms" / "sms.csv"
    if sms_csv.exists():
        print(f"Ingesting {sms_csv}...")
        df_sms = pd.read_csv(sms_csv, dtype={"user_id": str})
        df_sms.to_sql("sms", conn, if_exists="replace", index=False)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sms_user ON sms (user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sms_date ON sms (received_at_ist);")

    # 2. Ingest SIP plans
    sip_csv = RAW_DATA_DIR / "investment" / "sip_plans.csv"
    if sip_csv.exists():
        print(f"Ingesting {sip_csv}...")
        df_sip = pd.read_csv(sip_csv, dtype={"user_id": str})
        df_sip.to_sql("sip_plans", conn, if_exists="replace", index=False)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sip_user ON sip_plans (user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sip_status ON sip_plans (status);")

    # 3. Ingest Mandates
    mandates_csv = RAW_DATA_DIR / "insurance" / "mandates.csv"
    if mandates_csv.exists():
        print(f"Ingesting {mandates_csv}...")
        df_mandates = pd.read_csv(mandates_csv, dtype={"user_id": str})
        df_mandates.to_sql("mandates", conn, if_exists="replace", index=False)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_mandate_user ON mandates (user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_mandate_status ON mandates (status);")

    # 4. Ingest Loan EMIs
    emis_csv = RAW_DATA_DIR / "loan" / "emis.csv"
    if emis_csv.exists():
        print(f"Ingesting {emis_csv}...")
        df_emis = pd.read_csv(emis_csv, dtype={"user_id": str})
        df_emis.to_sql("loan_emis", conn, if_exists="replace", index=False)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_emi_user ON loan_emis (user_id);")

    # 5. User habit ledger for actions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS habit_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action_type TEXT,
        amount_inr REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
    );
    """)

    conn.commit()
    conn.close()
    print(f"Database initialized successfully at {DB_PATH}")


if __name__ == "__main__":
    init_db()
