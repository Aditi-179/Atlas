from pydantic import BaseModel
from typing import List, Dict
from app.features.risk_engine.schemas import RiskPredictionInput

class TwinProjection(BaseModel):
    month: int
    risk_score: float
    clinical_state: Dict[str, float]

class DigitalTwinResponse(BaseModel):
    baseline_trajectory: List[TwinProjection]
    optimized_trajectory: List[TwinProjection]
    clinical_narrative: str