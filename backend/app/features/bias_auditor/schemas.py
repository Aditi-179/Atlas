from pydantic import BaseModel
from typing import List, Dict

class EquityMetric(BaseModel):
    group_name: str
    avg_risk_score: float
    population_percentage: float
    disparate_impact_ratio: float # 1.0 is perfectly fair

class AuditReport(BaseModel):
    gender_equity: List[EquityMetric]
    income_equity: List[EquityMetric]
    overall_fairness_score: float
    llm_governance_advice: str