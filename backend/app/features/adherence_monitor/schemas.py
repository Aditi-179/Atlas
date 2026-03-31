from pydantic import BaseModel
from datetime import date
from typing import List, Optional, Dict

class AdherenceLog(BaseModel):
    patient_id: str
    log_date: date
    took_meds: bool
    healthy_diet: bool
    exercised: bool
    meds_detail: Optional[str] = None
    exercise_detail: Optional[str] = None

class AdherenceSummary(BaseModel):
    adherence_index: float  # Percentage (0-100)
    current_status: str     # "Stable", "At Risk", "Critical"
    trend: str              # "Improving" or "Declining"
    recent_logs: List[Dict] = [] # Recent activity details