from fastapi import APIRouter, HTTPException
from app.features.RAG.models import PatientHealthData, RAGInsightResponse
from app.features.RAG.service import generate_patient_insights

router = APIRouter()

@router.post("/insights", response_model=RAGInsightResponse, summary="Generate Contextual RAG Insights")
async def get_rag_insights(patient_payload: PatientHealthData):
    """
    Takes a patient's health profile alongside their XGBoost NCD Risk output,
    retrieves static medical context natively, and queries the Groq Agent
    to return a highly tailored, explainable JSON analysis.
    """
    try:
        # Convert Pydantic request to generic dict for the service logic
        patient_dict = patient_payload.model_dump()
        
        # Call RAG Service
        rag_output = await generate_patient_insights(patient_dict)
        
        return RAGInsightResponse(**rag_output)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Inference Failed: {str(e)}")
