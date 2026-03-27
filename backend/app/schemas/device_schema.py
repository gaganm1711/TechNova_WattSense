from pydantic import BaseModel

class Device(BaseModel):
    id: str
    name: str
    standbyPowerW: float
    pluggedIn: bool
    room: str
