from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

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


class RiskDistribution(BaseModel):
    red: int = 0
    yellow: int = 0
    green: int = 0


class InterventionConfig(BaseModel):
    home_visit_increase: float = Field(0, ge=0, le=100)
    counseling_sessions: float = Field(0, ge=0, le=100)
    screening_boost: float = Field(0, ge=0, le=100)


class PopulationSimulationRequest(BaseModel):
    source: Literal["mongo", "csv"] = "mongo"
    location_field: str = Field("phc", description="Field used for grouping, e.g. phc or village")
    phc: Optional[str] = Field(None, description="Optional PHC filter")
    csv_path: Optional[str] = Field(None, description="Optional CSV path when source=csv")
    forecast_months: int = Field(6, ge=1, le=24)
    intervention: InterventionConfig


class InterventionImpact(BaseModel):
    before_hospitalizations: int
    after_hospitalizations: int
    reduction_percent: float


class PopulationSimulationItem(BaseModel):
    phc: str
    population: int
    avg_risk_score: float
    risk_distribution: RiskDistribution
    intervention_impact: InterventionImpact


class PopulationSimulationResponse(BaseModel):
    source: str
    groups: List[PopulationSimulationItem]