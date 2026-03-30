from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.domain import UserInDB, UserCreate
from .schemas import Token
import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    existing_user = await db["users"].find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user_in.model_dump(exclude={"password"})
    user_dict["hashed_password"] = get_password_hash(user_in.password)
    user_dict["created_at"] = datetime.datetime.utcnow()
    
    result = await db["users"].insert_one(user_dict)
    
    # Generate Token
    access_token = create_access_token(subject=str(result.inserted_id))
    return {"access_token": access_token, "token_type": "bearer", "role": user_in.role, "user_id": str(result.inserted_id)}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=str(user["_id"]))
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"], "user_id": str(user["_id"])}
