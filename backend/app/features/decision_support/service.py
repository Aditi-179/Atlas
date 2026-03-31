import json
from groq import Groq
from app.core.config import settings
from .schemas import PatientClinicalData, ClinicalProtocolOutput
from app.core.llm_agent import llm

from app.features.adherence_monitor.service import adherence_service

class DecisionSupportService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    def generate_protocol(self, data: PatientClinicalData) -> ClinicalProtocolOutput:
        # Fetch adherence context for the patient
        adherence = adherence_service.get_patient_summary(data.patient_id)
        adherence_context = f"Patient Adherence Index: {adherence.adherence_index}% (Status: {adherence.current_status})."

        prompt = f"""
        You are CareFlow AI, a clinical decision support AI.
        Generate a strictly formatted JSON medical protocol for this patient.
        
        {adherence_context}
        NOTE: If adherence is < 50%, prioritize 'Urgent Home Visit' and 'Social Worker Referral' in your steps.
        
        Patient Data:
        Age/Gender: {data.age} {data.gender}
        Vitals: {data.vitals}
        Habits: {data.habits}
        Risk Tier: {data.risk_tier}
        
        Output JSON exactly like this:
        {{
            "summary": "1 sentence patient summary",
            "protocol_steps": [
                {{
                    "category": "Lifestyle",
                    "action": "Reduce sodium...",
                    "urgency": "Immediate",
                    "evidence_citation": "WHO Guidelines"
                }}
            ]
        }}
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            result_dict = json.loads(response.choices[0].message.content)
            return ClinicalProtocolOutput(**result_dict)
            
        except Exception as e:
            raise ValueError(f"Failed to generate protocol from Groq: {str(e)}")

# Singleton instance to be used by the router
decision_service = DecisionSupportService()