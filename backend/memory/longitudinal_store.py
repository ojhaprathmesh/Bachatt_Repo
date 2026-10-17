"""
Longitudinal Memory Store: Persists multi-session commitments, streaks, and reflections.
Member 1 Domain.
"""
import json
import os
from pathlib import Path
from typing import Dict, Any, Optional

MEMORY_DIR = Path(__file__).resolve().parent.parent / "data" / "memory"

def get_user_memory(user_id: str) -> Dict[str, Any]:
    os.makedirs(MEMORY_DIR, exist_ok=True)
    user_file = MEMORY_DIR / f"user_{user_id}.json"
    if user_file.exists():
        with open(user_file, "r") as f:
            return json.load(f)
    
    # Default memory baseline
    return {
        "user_id": user_id,
        "persona_name": "Ramesh",
        "streak_days": 3,
        "total_saved_inr": 150.0,
        "commitments": [
            {
                "week": 41,
                "date": "2026-10-07",
                "goal": "Maintain ₹100 buffer for EMI",
                "status": "BROKEN"
            }
        ]
    }

def update_user_memory(user_id: str, new_streak: int, additional_savings: float) -> Dict[str, Any]:
    mem = get_user_memory(user_id)
    mem["streak_days"] = new_streak
    mem["total_saved_inr"] = mem.get("total_saved_inr", 0.0) + additional_savings
    
    user_file = MEMORY_DIR / f"user_{user_id}.json"
    with open(user_file, "w") as f:
        json.dump(mem, f, indent=2)
    
    return mem
