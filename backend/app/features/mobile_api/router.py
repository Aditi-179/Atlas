from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import db
from app.core.dependencies import get_current_health_worker, get_current_patient, get_current_user
from bson import ObjectId
from typing import List, Dict, Any

router = APIRouter()

# -----------------
# 👩‍⚕️ Health Worker Endpoints
# -----------------

@router.get("/worker/patients")
async def get_worker_patients(worker: dict = Depends(get_current_health_worker)):
    """Health workers get a list of all patients assigned to them."""
    if db is None: raise HTTPException(status_code=500, detail="DB Error")
    
    # In a real app we'd filter by `assigned_worker_id`, but for MVP return all patient roles
    cursor = db["users"].find({"role": "patient"}, {"hashed_password": 0})
    patients = await cursor.to_list(length=100)
    
    # Format _id to string
    for p in patients:
        p["id"] = str(p["_id"])
        del p["_id"]
        
        # Optionally fetch their latest record
        record = await db["patient_records"].find_one({"user_id": p["id"]}, sort=[("created_at", -1)])
        p["latest_record"] = record if record else None
        
        # Remove object ids from record as well
        if p["latest_record"] and "_id" in p["latest_record"]:
            p["latest_record"]["id"] = str(p["latest_record"]["_id"])
            del p["latest_record"]["_id"]
            
    return patients

@router.post("/worker/patients/{patient_id}/update")
async def update_patient_record(patient_id: str, record_data: dict, worker: dict = Depends(get_current_health_worker)):
    """Worker visits patient and updates data. Generates Risk/Protocol if possible."""
    if db is None: raise HTTPException(status_code=500, detail="DB Error")
    
    # 1. Save new data point
    import datetime
    new_record = {
        "user_id": patient_id,
        "worker_id": str(worker["_id"]),
        "vitals": record_data.get("vitals", {}),
        "habits": record_data.get("habits", {}),
        "age": record_data.get("age", 45),
        "gender": record_data.get("gender", "Unknown"),
        "created_at": datetime.datetime.utcnow()
    }
    
    # 2. Risk Engine & Decision Support could be triggered here.
    # For MVP, we will save the raw data, let the frontend trigger the existing endpoints
    # or implement a unified call later.
    
    result = await db["patient_records"].insert_one(new_record)
    new_record["id"] = str(result.inserted_id)
    new_record.pop("_id", None)
    
    return {"message": "Patient data updated successfully", "record": new_record}

# -----------------
# 👤 Patient Endpoints
# -----------------

@router.get("/patient/me")
async def get_my_record(patient: dict = Depends(get_current_patient)):
    """Patient gets their own profile and latest risk data."""
    if db is None: raise HTTPException(status_code=500, detail="DB Error")
    
    patient_id = str(patient["_id"])
    record = await db["patient_records"].find_one({"user_id": patient_id}, sort=[("created_at", -1)])
    
    patient_data = {
        "id": patient_id,
        "email": patient["email"],
        "role": patient["role"]
    }
    
    if record:
        record["id"] = str(record["_id"])
        del record["_id"]
        patient_data["latest_record"] = record
        
    return patient_data
