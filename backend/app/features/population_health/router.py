from fastapi import APIRouter
from .schemas import PopulationStats
from .service import pop_service

router = APIRouter()

@router.get("/stats", response_model=PopulationStats)
async def get_population_dashboard_data():
    """Returns aggregated risk data for all patients screened so far."""
    return pop_service.get_stats()