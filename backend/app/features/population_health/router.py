import pandas as pd
import os
from fastapi import APIRouter
from .service import pop_service

router = APIRouter()

@router.get("/stats")
async def get_population_stats():
    return await pop_service.get_stats()

@router.get("/raw-stats")
async def get_raw_csv_stats():
    # Path to your new demo CSV
    csv_path = os.path.join(os.getcwd(), "app/data/ui_final_demo_data.csv")
    if not os.path.exists(csv_path):
        return {"error": "File not found"}
    
    df = pd.read_csv(csv_path)
    # Convert to JSON records for the frontend
    return df.to_dict(orient="records")