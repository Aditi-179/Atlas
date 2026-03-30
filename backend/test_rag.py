import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from app.features.RAG.models import PatientHealthData
from app.features.RAG.service import generate_patient_insights

async def test():
    patient = PatientHealthData(
        bmi=35.5,
        age=4,
        high_bp=1,
        high_chol=1,
        smoker=1,
        phys_activity=0,
        hvy_alcohol=1,
        ncd_risk_probability=0.88,
        risk_tier="High" # Critical patient
    )
    
    print(f"Testing RAG with patient risk: {patient.ncd_risk_probability}")
    result = await generate_patient_insights(patient.model_dump())
    
    print("\n--- RAG Output JSON ---")
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(test())
