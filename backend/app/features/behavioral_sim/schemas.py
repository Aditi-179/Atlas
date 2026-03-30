from pydantic import BaseModel, Field
from app.features.risk_engine.schemas import RiskPredictionInput

class SimulationInput(BaseModel):
    current_state: RiskPredictionInput
    modified_habits: dict = Field(..., example={"Smoker": 0, "Veggies": 1, "PhysActivity": 1})

class SimulationOutput(BaseModel):
    current_risk: float
    simulated_risk: float
    risk_reduction: float
    impact_message: str