from fastapi import APIRouter, HTTPException
from app.features.risk_engine.schemas import RiskPredictionInput
from .schemas import DigitalTwinResponse
from .service import twin_service

router = APIRouter()

@router.post("/project", response_model=DigitalTwinResponse)
async def project_digital_twin(data: RiskPredictionInput):
    """Generates a 12-month forward projection Digital Twin."""
    try:
        return twin_service.generate_twin(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))