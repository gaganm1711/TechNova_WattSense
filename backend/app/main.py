from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user_routes, device_routes, leaderboard_routes, auth_routes, vision_routes, alert_routes

app = FastAPI(title="WattSense API Enterprise")

# Setup CORS for the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Feature Mounts
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(device_routes.router)
app.include_router(leaderboard_routes.router)
app.include_router(vision_routes.router)
app.include_router(alert_routes.router)

@app.get("/")
def root():
    return {"message": "WattSense Enterprise Backend Live"}
