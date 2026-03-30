from fastapi import APIRouter, HTTPException
from .schemas import RiskPredictionInput, RiskPredictionOutput
from .service import ml_service

router = APIRouter()

@router.post("/predict", response_model=RiskPredictionOutput)
async def get_risk_prediction(patient_data: RiskPredictionInput):
    try:
        # This calls our new service which uses the RF model in app/models
        prediction = ml_service.get_prediction(patient_data)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))