from fastapi import APIRouter, HTTPException
from app.database.mongo import db
from app.services.calculation_service import calculate_metrics
from app.services.insight_service import generate_insight
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/devices", tags=["devices"])

class AnalysisRequest(BaseModel):
    user_id: str
    devices: List[dict]

# 1. Main Analysis computation
@router.post("/analyze")
async def analyze_devices(data: AnalysisRequest):
    devices = data.devices
    metrics = calculate_metrics(devices)
    insight = generate_insight(devices)

    # For gamification, save the updated metric bounds passively to the user's DB record
    if db is not None and data.user_id:
        try:
            from bson import ObjectId
            await db.users.update_one(
                {"_id": ObjectId(data.user_id)},
                {"$set": {"totalSavings": metrics.get("total_cost", 0)}} # Hacky simulation of dynamic DB saves
            )
        except Exception as e:
            pass

    return {
        "metrics": metrics,
        "insight": insight
    }

# 2. Database Initial Seeding / Get For User
@router.get("/{user_id}")
async def get_user_devices(user_id: str):
    if db is None:
        raise HTTPException(status_code=500, detail="Database Offline")
        
    # Find all devices owned by user
    cursor = db.devices.find({"user_id": user_id})
    user_devices = []
    async for d in cursor:
        d["_id"] = str(d["_id"])
        user_devices.append(d)
        
    if not user_devices:
        # Seed dummy devices for a new user seamlessly during the hackathon pitch demo
        default_devices = [
            {"id": "dev-1", "user_id": user_id, "name": "Set-top Box", "icon": "tv", "standbyPowerW": 15, "pluggedIn": True, "room": "Living Room", "tipContext": "Unplug Set-top box at night.", "dailyCycle": [100]*24},
            {"id": "dev-2", "user_id": user_id, "name": "Smart TV", "icon": "display", "standbyPowerW": 5, "pluggedIn": True, "room": "Living Room", "tipContext": "Use smart power strip.", "dailyCycle": [100]*24},
            {"id": "dev-3", "user_id": user_id, "name": "Phone Charger", "icon": "plug", "standbyPowerW": 0.5, "pluggedIn": True, "room": "Bedroom", "tipContext": "Psychological win.", "dailyCycle": [10]*24},
            {"id": "dev-4", "user_id": user_id, "name": "Wi-Fi Router", "icon": "wifi", "standbyPowerW": 8, "pluggedIn": True, "room": "Living Room", "tipContext": "Schedule turn off 1AM-6AM.", "dailyCycle": [100]*24}
        ]
        await db.devices.insert_many(default_devices)
        return default_devices
        
    return user_devices

# 3. Toggle Sync
@router.post("/toggle")
async def toggle_device(payload: dict):
    if db is None: return {"status": "offline"}
    doc_id = payload.get("id")
    state = payload.get("pluggedIn")
    await db.devices.update_one({"id": doc_id}, {"$set": {"pluggedIn": state}})
    return {"status": "synced"}
