from fastapi import APIRouter, HTTPException, status
from app.database.mongo import db
from app.schemas.user_schema import UserCreate, UserLogin
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup")
async def signup(user: UserCreate):
    if db is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected.")
    
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "name": f"{user.firstName} {user.lastName}",
        "email": user.email,
        "password": user.password, # In production this would be hashed via bcrypt
        "totalSavings": 0.0,
        "efficiencyScore": 50
    }
    
    result = await db.users.insert_one(new_user)
    
    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id),
        "name": new_user["name"]
    }

@router.post("/login")
async def login(credentials: UserLogin):
    if db is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected.")
        
    user = await db.users.find_one({"email": credentials.email, "password": credentials.password})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {
        "message": "Login successful",
        "user_id": str(user["_id"]),
        "name": user["name"]
    }
