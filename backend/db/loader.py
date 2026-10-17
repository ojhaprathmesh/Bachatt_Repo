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

    # Ingest SMS table if exists
    sms_csv = RAW_DATA_DIR / "sms" / "sms.csv"
    if sms_csv.exists():
        print(f"Ingesting {sms_csv}...")
        df_sms = pd.read_csv(sms_csv, nrows=10000)  # fast initial load
        df_sms.to_sql("sms", conn, if_exists="replace", index=False)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sms_user ON sms (user_id);")

    # Ingest SIP plans if exists
    sip_csv = RAW_DATA_DIR / "investment" / "sip_plans.csv"
    if sip_csv.exists():
        print(f"Ingesting {sip_csv}...")
        df_sip = pd.read_csv(sip_csv)
        df_sip.to_sql("sip_plans", conn, if_exists="replace", index=False)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sip_user ON sip_plans (user_id);")

    # Ingest Mandates if exists
    mandates_csv = RAW_DATA_DIR / "insurance" / "mandates.csv"
    if mandates_csv.exists():
        print(f"Ingesting {mandates_csv}...")
        df_mandates = pd.read_csv(mandates_csv)
        df_mandates.to_sql("mandates", conn, if_exists="replace", index=False)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_mandate_user ON mandates (user_id);")

    # User habit ledger for actions
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
