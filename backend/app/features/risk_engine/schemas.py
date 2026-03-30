from pydantic import BaseModel, Field
from typing import List


class RiskContributor(BaseModel):
    feature: str
    impact: float

class RiskPredictionInput(BaseModel):
    # Clinical Features
    HighBP: int = Field(..., description="1 = High Blood Pressure, 0 = Normal")
    HighChol: int = Field(..., description="1 = High Cholesterol, 0 = Normal")
    BMI: float = Field(..., ge=10.0, le=60.0)
    DiffWalk: int = Field(..., description="1 = Difficulty Walking, 0 = No")
    Age: int
    Sex: int = Field(..., description="1 = Male, 0 = Female") # <--- ADDED


    # Behavioral Features
    Smoker: int = Field(..., description="1 = Current/Former, 0 = Never")
    PhysActivity: int = Field(..., description="1 = Active, 0 = Sedentary")
    Veggies: int = Field(..., description="1 = Consumes daily, 0 = No")
    HvyAlcoholConsump: int = Field(..., description="1 = Heavy, 0 = No")

    # Social Determinants (SDoH)
    Income: int = Field(..., ge=1, le=8, description="Income Scale (1-8)")
    Education: int = Field(..., ge=1, le=6, description="Education Scale (1-6)")

class RiskPredictionOutput(BaseModel):
    risk_score: float
    risk_tier: str
    model_used: str
    accuracy_at_training: float
    # SHAP Explainability
    top_contributors: List[RiskContributor]