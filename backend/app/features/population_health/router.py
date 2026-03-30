import os
import csv
from fastapi import APIRouter, HTTPException

from .schemas import PopulationSimulationRequest, PopulationSimulationResponse
from .service import pop_service

router = APIRouter()


@router.get("/resource-allocation", response_model=PopulationSimulationResponse)
async def get_resource_allocation(
    source: str = "mongo",
    location_field: str = "phc",
    phc: str | None = None,
    csv_path: str | None = None,
):
    groups = await pop_service.get_population_data(
        source=source,
        location_field=location_field,
        phc=phc,
        csv_path=csv_path,
    )
    return PopulationSimulationResponse(source=source, groups=groups)


@router.post("/resource-allocation/simulate", response_model=PopulationSimulationResponse)
async def simulate_resource_allocation(payload: PopulationSimulationRequest):
    groups = await pop_service.simulate_intervention(
        intervention=payload.intervention,
        source=payload.source,
        location_field=payload.location_field,
        phc=payload.phc,
        csv_path=payload.csv_path,
        forecast_months=payload.forecast_months,
    )
    return PopulationSimulationResponse(source=payload.source, groups=groups)



@router.get("/resource-allocation", response_model=PopulationSimulationResponse)
async def get_resource_allocation(
    source: str = "mongo",
    location_field: str = "phc",
    phc: str | None = None,
    csv_path: str | None = None,
):
    groups = await pop_service.get_population_data(
        source=source,
        location_field=location_field,
        phc=phc,
        csv_path=csv_path,
    )
    return PopulationSimulationResponse(source=source, groups=groups)


@router.post("/resource-allocation/simulate", response_model=PopulationSimulationResponse)
async def simulate_resource_allocation(payload: PopulationSimulationRequest):
    groups = await pop_service.simulate_intervention(
        intervention=payload.intervention,
        source=payload.source,
        location_field=payload.location_field,
        phc=payload.phc,
        csv_path=payload.csv_path,
        forecast_months=payload.forecast_months,
    )
    return PopulationSimulationResponse(source=payload.source, groups=groups)


@router.get("/stats")
async def get_population_stats():
    return pop_service.get_stats()

@router.get("/raw-stats")
async def get_raw_csv_stats():
    csv_path = os.path.join(os.getcwd(), "app/data/ui_final_demo_data.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    rows = []
    with open(csv_path, "r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            rows.append(row)
            if len(rows) >= 5000:
                break

    return rows