from fastapi import APIRouter, HTTPException
from .schemas import SimulationInput, SimulationOutput
from .service import behavioral_sim_service

router = APIRouter()

@router.post("/run", response_model=SimulationOutput)
async def simulate_lifestyle_change(data: SimulationInput):
    try:
        result = behavioral_sim_service.run_simulation(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))