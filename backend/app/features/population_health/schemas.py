from pydantic import BaseModel
from typing import Dict, List

class PopulationStats(BaseModel):
    total_screened: int
    risk_distribution: Dict[str, int] # e.g., {"Red": 15, "Yellow": 30, "Green": 55}
    average_risk_score: float
    high_risk_priority_count: int

class PatientRecord(BaseModel):
    # We save a subset of data for the dashboard
    timestamp: str
    risk_score: float
    risk_tier: str
    age_group: str # Engineered for the dashboard