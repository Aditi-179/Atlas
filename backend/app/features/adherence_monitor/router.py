from fastapi import APIRouter, HTTPException
from .schemas import AdherenceLog, AdherenceSummary
from .service import adherence_service

router = APIRouter()

@router.post("/log")
async def log_adherence(log: AdherenceLog):
    """Logs daily patient adherence activity (meds, diet, exercise)."""
    try:
        return adherence_service.log_daily_activity(log)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{patient_id}", response_model=AdherenceSummary)
async def get_adherence_summary(patient_id: str):
    """Returns a calculated adherence index and clinical status for a patient."""
    try:
        return adherence_service.get_patient_summary(patient_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))