from pydantic import BaseModel, Field
from typing import List, Optional

class PatientHealthData(BaseModel):
    # Core biological markers
    bmi: float = Field(..., description="Body Mass Index")
    age: int = Field(..., description="Age category/value")
    high_bp: int = Field(..., description="High Blood Pressure indicator (1=Yes, 0=No)")
    high_chol: int = Field(..., description="High Cholesterol indicator (1=Yes, 0=No)")
    
    # Lifestyle factors
    smoker: int = Field(..., description="Smoker indicator (1=Yes, 0=No)")
    phys_activity: int = Field(..., description="Physical Activity indicator (1=Yes, 0=No)")
    hvy_alcohol: int = Field(..., description="Heavy Alcohol Consumption (1=Yes, 0=No)")
    
    # The output from the XGBoost model
    ncd_risk_probability: float = Field(..., description="Probability of Non-Communicable Disease")
    risk_tier: str = Field(..., description="Risk Tier (e.g., High, Medium, Low)")

    # Rich patient context for LLM personalization
    patient_name: Optional[str] = Field(default=None, description="Patient's full name")
    blood_pressure_systolic: Optional[int] = Field(default=None, description="Systolic blood pressure (mmHg)")
    blood_pressure_diastolic: Optional[int] = Field(default=None, description="Diastolic blood pressure (mmHg)")
    blood_sugar: Optional[float] = Field(default=None, description="Blood sugar level (mg/dL)")
    physical_activity_minutes: Optional[int] = Field(default=None, description="Physical activity (min/week)")
    primary_risk_factor: Optional[str] = Field(default=None, description="Primary identified risk factor")
    top_risk_contributors: Optional[str] = Field(default=None, description="JSON-serialized SHAP contributors list")

    # Optional copilot question to tailor the LLM response
    user_query: Optional[str] = Field(default=None, description="Optional custom prompt to query the copilot")


class RAGInsightResponse(BaseModel):
    analysis_summary: str = Field(..., description="A gentle, clear summary of the patient's risk profile.")
    primary_risk_factors: List[str] = Field(..., description="The main factors contributing to their NCD risk.")
    clinical_guidelines: List[str] = Field(..., description="Retrieved actionable medical guidelines tailored to the patient.")
    recommended_action: str = Field(..., description="The final concluding recommendation for the patient.")
