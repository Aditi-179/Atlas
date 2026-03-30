from fastapi import APIRouter
from app.models.logistic import train_model
from app.features.risk_engine.service import get_risk_prediction
from app.features.risk_engine.schemas import PatientInput

router = APIRouter(prefix="/risk", tags=["Risk Engine"])


@router.post("/predict")
def predict_api(data: PatientInput):
    return get_risk_prediction(data.dict())