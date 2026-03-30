from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .service import agent_service

router = APIRouter()

class VoiceInput(BaseModel):
    transcript: str

@router.post("/process-voice")
async def process_voice(input_data: VoiceInput):
    """Takes a raw text transcript and returns structured clinical data + a spoken reply."""
    try:
        return agent_service.process_voice_transcript(input_data.transcript)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))