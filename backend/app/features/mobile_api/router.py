from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import db
from app.core.dependencies import get_current_health_worker, get_current_patient, get_current_user
from bson import ObjectId
from typing import List, Dict, Any
import datetime

# ML & AI Services
from app.features.risk_engine.service import ml_service
from app.features.risk_engine.schemas import RiskPredictionInput
from app.features.decision_support.service import decision_service
from app.features.decision_support.schemas import PatientClinicalData

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
    """Worker visits patient and updates data. Generates Risk/Protocol automatically."""
    if db is None: raise HTTPException(status_code=500, detail="DB Error")
    
    # 1. Map incoming frontend data to the ML Schema
    try:
        # The mobile app will send 'vitals' and 'habits' as nested dicts
        vitals = record_data.get("vitals", {})
        habits = record_data.get("habits", {})
        
        # ML Input Mapping
        ml_input = RiskPredictionInput(
            HighBP=int(vitals.get("HighBP", 0)),
            HighChol=int(vitals.get("HighChol", 0)),
            BMI=float(vitals.get("BMI", 25.0)),
            DiffWalk=int(habits.get("DiffWalk", 0)),
            Age=int(record_data.get("Age", 45)),
            Sex=int(record_data.get("Sex", 1)), # 1=Male, 0=Female
            Smoker=int(habits.get("Smoker", 0)),
            PhysActivity=int(habits.get("PhysActivity", 1)),
            Veggies=int(habits.get("Veggies", 1)),
            HvyAlcoholConsump=int(habits.get("HvyAlcoholConsump", 0)),
            Income=int(record_data.get("Income", 5)),
            Education=int(record_data.get("Education", 4))
        )
        
        # 2. Get ML Prediction & XAI
        prediction = await ml_service.get_prediction(ml_input)
        
        # 3. Get AI Care Protocol (Groq)
        protocol_input = PatientClinicalData(
            patient_id=patient_id,
            age=ml_input.Age,
            gender="Male" if ml_input.Sex == 1 else "Female",
            vitals=vitals,
            habits=habits,
            risk_tier=prediction.risk_tier
        )
        protocol = decision_service.generate_protocol(protocol_input)
        
    except Exception as e:
        # Fallback if ML or AI fails during development
        print(f"Error in ML/AI pipeline: {e}")
        prediction = None
        protocol = None

    # 4. Save combined data point to MongoDB
    new_record = {
        "user_id": patient_id,
        "worker_id": str(worker["_id"]),
        "vitals": vitals,
        "habits": habits,
        "age": record_data.get("Age", 45),
        "gender": record_data.get("gender", "Unknown"),
        
        # Prediction & Protocol Results
        "risk_score": prediction.risk_score if prediction else None,
        "risk_tier": prediction.risk_tier if prediction else "Unknown",
        "top_contributors": [c.model_dump() for c in prediction.top_contributors] if prediction else [],
        "protocol": protocol.model_dump() if protocol else None,
        
        "created_at": datetime.datetime.utcnow()
    }
    
    result = await db["patient_records"].insert_one(new_record)
    new_record["id"] = str(result.inserted_id)
    new_record.pop("_id", None)
    
    return {
        "message": "Clinical reasoning complete", 
        "record": new_record
    }

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
