from pydantic import BaseModel, Field
from typing import List, Dict, Any

class PatientClinicalData(BaseModel):
    patient_id: str = Field(default="anonymous")
    age: int
    gender: str
    vitals: Dict[str, Any] = Field(..., example={"systolic_bp": 145, "bmi": 28})
    habits: Dict[str, Any] = Field(..., example={"smoking": "current", "diet": "high_sodium"})
    risk_tier: str = Field(..., example="Red")

class ActionStep(BaseModel):
    category: str = Field(description="Counseling, Referral, or Lifestyle")
    action: str
    urgency: str
    evidence_citation: str

class ClinicalProtocolOutput(BaseModel):
    summary: str
    protocol_steps: List[ActionStep]