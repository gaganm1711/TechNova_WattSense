from fastapi import APIRouter
from app.database.mongo import db

router = APIRouter(prefix="/api/user", tags=["user"])

@router.post("/")
async def create_user(user: dict):
    if db is None:
        return {"error": "MongoDB not connected."}
    result = await db.users.insert_one(user)
    return {"id": str(result.inserted_id)}

@router.get("/{user_id}")
async def get_user(user_id: str):
    if db is None:
        return {"error": "MongoDB not connected."}
    user = await db.users.find_one({"_id": user_id})
    if user:
        user["_id"] = str(user["_id"])
    return user
