from fastapi import APIRouter, HTTPException
from .schemas import PatientClinicalData, ClinicalProtocolOutput
from .service import decision_service

router = APIRouter()

@router.post("/generate", response_model=ClinicalProtocolOutput)
async def create_care_protocol(patient_data: PatientClinicalData):
    """
    Generate an AI-driven clinical protocol using Groq LLM.
    """
    try:
        protocol = decision_service.generate_protocol(patient_data)
        return protocol
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))