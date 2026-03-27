from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    totalSavings: float
    efficiencyScore: int
