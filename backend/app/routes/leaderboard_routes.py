from fastapi import APIRouter
from app.database.mongo import db

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("/")
async def get_leaderboard():
    if db is None:
        # Fallback dummy data if MongoDB is offline
        return [
            {"name": "EcoWarrior", "savings": 4500},
            {"name": "Rahul M.", "savings": 3200},
            {"name": "You", "savings": 1200},
            {"name": "Sneha P.", "savings": -500}
        ]
        
    users = db.users.find().sort("totalSavings", -1).limit(10)
    
    result = []
    async for u in users:
        result.append({
            "name": u.get("name"),
            "savings": u.get("totalSavings", 0)
        })

    return result
