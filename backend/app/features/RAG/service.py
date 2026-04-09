import logging
from app.core.llm_agent import llm
from app.features.RAG.knowledge_base import retrieve_clinical_context

logger = logging.getLogger(__name__)

async def generate_patient_insights(patient_data: dict) -> dict:
    """
    RAG Orchestration Service.
    1. Retrieve Context based on the specific patient's risk profile.
    2. Build query-aware Augmented Prompts.
    3. Query the Groq Core Agent and return JSON insights.
    """
    # 1. Retrieval
    context_list = retrieve_clinical_context(patient_data)
    context_string = "\n".join(context_list)

    logger.info(f"Retrieved {len(context_list)} context chunks for patient.")

    # 2. Extract patient context fields
    user_query = patient_data.get('user_query')
    name_label = patient_data.get('patient_name') or "this patient"

    bp_sys = patient_data.get('blood_pressure_systolic')
    bp_dia = patient_data.get('blood_pressure_diastolic')
    bp_str = f"{bp_sys}/{bp_dia} mmHg" if bp_sys and bp_dia else "N/A"
    blood_sugar = patient_data.get('blood_sugar')
    pa_min = patient_data.get('physical_activity_minutes')
    primary_rf = patient_data.get('primary_risk_factor') or "Not specified"
    top_contributors = patient_data.get('top_risk_contributors')

    rich_profile = f"""Patient Profile:
- Name: {name_label}
- NCD Risk Probability: {patient_data.get('ncd_risk_probability', 0):.0%} ({patient_data.get('risk_tier', 'N/A')} tier)
- Age Category: {patient_data.get('age', 'N/A')}
- BMI: {patient_data.get('bmi', 'N/A')}
- Blood Pressure: {bp_str}
- Blood Sugar: {f"{blood_sugar} mg/dL" if blood_sugar else 'N/A'}
- Physical Activity: {f"{pa_min} min/week" if pa_min is not None else 'N/A'}
- High BP: {'Yes' if patient_data.get('high_bp') else 'No'}
- High Cholesterol: {'Yes' if patient_data.get('high_chol') else 'No'}
- Smoker: {'Yes' if patient_data.get('smoker') else 'No'}
- Heavy Alcohol: {'Yes' if patient_data.get('hvy_alcohol') else 'No'}
- Primary Risk Factor: {primary_rf}
- Top AI Risk Contributors (SHAP): {top_contributors if top_contributors else 'N/A'}
"""

    # 3. Augmented Prompt Engineering — dual-mode based on whether a specific question was asked
    if user_query:
        # QUESTION MODE: Repurpose all JSON fields to directly answer the clinician's question.
        # The LLM must answer the question — not give a generic risk summary.
        system_prompt = f"""You are the CareFlow AI Clinical Decision Support Engine.
A physician is consulting you about a specific patient and has asked you a very specific question.

## RETRIEVED MEDICAL EVIDENCE (USE THIS TO SUPPORT YOUR ANSWER):
---
{context_string}
---

## CRITICAL INSTRUCTIONS:
Your ONLY job is to answer the clinician's exact question, fully and in detail, personalized to this patient.

Rules you MUST follow:
1. DO NOT give a generic clinical overview — answer the question that was asked.
2. Answer specifically for THIS patient using their actual values (BMI, BP, blood sugar, etc.).
3. Be thorough and structured. Use ** bold **, bullet points, and numbered steps where appropriate.
4. Examples of how to handle different question types:
   - "prepare a diet plan" → Write a real, structured daily diet plan (breakfast, lunch, dinner, snacks) tailored to the patient's conditions (hypertension → DASH, high BMI → calorie deficit, high cholesterol → low saturated fat, etc.)
   - "explain my risk" → Break down the exact factors driving this patient's risk score with their actual values
   - "smoking cessation plan" → Give a week-by-week cessation protocol using the 5A model
   - "care plan" → Write a time-bound clinical care plan with 30/60/90 day milestones
   - "exercise plan" → Prescribe a specific weekly exercise routine appropriate to their fitness level

Respond in this EXACT JSON format (all fields are REQUIRED):
{{
    "analysis_summary": "Your complete, detailed answer to the clinician's question. This is the MAIN content — make it thorough, structured with headers/bullets, and entirely specific to {name_label}'s actual health data. For a diet plan, write the full plan here.",
    "primary_risk_factors": ["The patient conditions most relevant to your answer", "e.g. Hypertension — BP {bp_str}", "High BMI — {patient_data.get('bmi', 'N/A')}"],
    "clinical_guidelines": ["Key evidence-based point 1 supporting your plan", "Key point 2", "Key point 3 — include as many specific steps or recommendations as needed"],
    "recommended_action": "One concrete, actionable sentence about the single most important first step for {name_label} right now."
}}
"""
        user_prompt = f"""The clinician's question: "{user_query}"

{rich_profile}

Answer the question completely and specifically for {name_label}. Output only the valid JSON."""

    else:
        # OVERVIEW MODE: No specific question — generate a standard risk analysis
        system_prompt = f"""You are the CareFlow AI Clinical Decision Support Engine.
You are assisting a physician by analyzing a patient's Non-Communicable Disease (NCD) risk profile.

## RETRIEVED MEDICAL CONTEXT (USE THIS FACTUALLY):
---
{context_string}
---

Analyze the patient data using the retrieved context and standard medical knowledge.
Break down why the patient's risk is what it is and provide actionable clinical guidelines.

Respond STRICTLY in this JSON format:
{{
    "analysis_summary": "Short 2–3 sentence overview of their overall risk state.",
    "primary_risk_factors": ["Factor 1", "Factor 2"],
    "clinical_guidelines": ["Guideline 1", "Guideline 2"],
    "recommended_action": "Patient should immediately..."
}}
"""
        user_prompt = f"""Please analyze the following patient profile and provide a clinical risk overview.

{rich_profile}

Provide a comprehensive overview of {name_label}'s risk profile. Output only the valid JSON."""

    # 4. Call Core LLM Agent
    try:
        # temperature=0.3 for question mode (allows richer, descriptive answers)
        # temperature=0.1 for overview mode (deterministic clinical output)
        temperature = 0.3 if user_query else 0.1
        result_json = llm.generate_json(system_prompt=system_prompt, user_prompt=user_prompt, temperature=temperature)
        return result_json

    except Exception as e:
        logger.error(f"RAG Service Error: {str(e)}")
        return {
            "analysis_summary": "Error generating insights due to LLM failure.",
            "primary_risk_factors": ["System Error"],
            "clinical_guidelines": ["Consult primary physician offline."],
            "recommended_action": "System unavailable."
        }
