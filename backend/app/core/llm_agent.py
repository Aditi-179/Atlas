import json
from groq import Groq
from app.core.config import settings

class GroqAgent:
    """
    Centralized Core LLM Agent for Aegis Health OS.
    Can be imported by any feature module that requires AI reasoning.
    """
    def __init__(self):
        # Initialize the client once for the whole application
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    def generate_json(self, system_prompt: str, user_prompt: str, temperature: float = 0.1) -> dict:
        """
        Generic method to call Groq and guarantee a JSON dictionary response.
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                response_format={"type": "json_object"}
            )
            
            # Parse and return the JSON string as a Python dictionary
            result_str = response.choices[0].message.content
            return json.loads(result_str)
            
        except Exception as e:
            # Centralized error handling for LLM failures
            raise ValueError(f"Groq LLM Generation Failed: {str(e)}")

# Instantiate a single global instance
llm = GroqAgent()