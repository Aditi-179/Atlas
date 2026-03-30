from pydantic import BaseModel, Field
from typing import Dict, Any
from app.features.risk_engine.schemas import RiskPredictionInput

class VoiceTranscriptInput(BaseModel):
    transcript: str = Field(..., description="Raw text converted from CHW voice input")
    language: str = Field(default="en", description="Language code (e.g., 'en', 'hi', 'te')")

class AgentResponseOutput(BaseModel):
    # We reuse the Risk Engine's strict input schema so the parsed data is guaranteed to work
    structured_clinical_data: RiskPredictionInput 
    spoken_confirmation: str = Field(..., description="A conversational reply for the TTS engine to read aloud")
    confidence_score: float = Field(default=0.95, description="LLM confidence in extraction accuracy")