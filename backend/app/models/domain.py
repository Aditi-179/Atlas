from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Helper for handling MongoDB ObjectId in Pydantic v2
class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.str_schema()

class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(..., pattern="^(worker|patient)$")

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(UserBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime

    class Config:
        populate_by_name = True

class PatientRecordBase(BaseModel):
    user_id: str
    assigned_worker_id: Optional[str] = None
    age: int
    gender: str
    vitals: Dict[str, float]
    habits: Dict[str, str]

class PatientRecordCreate(PatientRecordBase):
    pass

class PatientRecord(PatientRecordBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    risk_score: Optional[float] = None
    risk_tier: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
