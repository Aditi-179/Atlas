from fastapi import APIRouter, HTTPException
from .schemas import RiskPredictionInput, RiskPredictionOutput
from .service import ml_service

router = APIRouter()

@router.post("/predict", response_model=RiskPredictionOutput)
async def get_risk_prediction(patient_data: RiskPredictionInput):
    try:
        return ml_service.get_prediction(patient_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))