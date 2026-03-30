from app.core.llm_agent import llm
from app.features.risk_engine.schemas import RiskPredictionInput

class HealthAgentService:
    def process_voice_transcript(self, transcript: str) -> dict:
        """
        Uses Groq to parse messy spoken language into structured clinical data.
        It also generates a conversational response for the voice assistant to speak back.
        """
        system_prompt = """
        You are 'Aegis', an AI assistant for Community Health Workers.
        Extract clinical entities from the transcript and map them to this exact JSON schema:
        {
            "extracted_data": {
                "Age": int (1-13 scale, where 18-24=1, 25-29=2... 80+=13. Default to 5 if unknown),
                "Sex": int (1 for Male, 0 for Female),
                "BMI": float (Calculate if height/weight given, else default 25.0),
                "HighBP": int (1 if high/hypertension mentioned, else 0),
                "HighChol": int (1 if high cholesterol mentioned, else 0),
                "Smoker": int (1 if they smoke/tobacco, else 0),
                "PhysActivity": int (1 if active/exercise, 0 if sedentary/none),
                "Fruits": int (1 if they eat fruits, else 0),
                "Veggies": int (1 if they eat veggies, else 0),
                "HvyAlcoholConsump": int (1 if heavy drinking mentioned, else 0),
                "DiffWalk": int (1 if mobility issues/limp mentioned, else 0),
                "Education": int (1-6 scale, default 4),
                "Income": int (1-8 scale, default 5)
            },
            "spoken_response": "A brief, encouraging conversational confirmation in English (e.g., 'Got it. I have logged a 50-year-old male with high blood pressure. Calculating risk now.')"
        }
        If a value is not mentioned in the transcript, use the provided defaults.
        """

        try:
            # Call Groq to parse the transcript
            response = llm.generate_json(system_prompt, f"Transcript: {transcript}")
            
            # Validate that the extracted data matches our strict schema
            validated_data = RiskPredictionInput(**response.get("extracted_data", {}))
            
            return {
                "structured_data": validated_data.model_dump(),
                "spoken_response": response.get("spoken_response", "Data processed successfully.")
            }
        except Exception as e:
            raise ValueError(f"Agent failed to parse transcript: {str(e)}")

agent_service = HealthAgentService()