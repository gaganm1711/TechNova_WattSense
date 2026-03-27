from motor.motor_asyncio import AsyncIOMotorClient

# Using standard localhost MongoDB URI (ensure mongod is running locally during demo)
try:
    client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    db = client.wattsense
except Exception as e:
    print("MongoDB connection warning: ", e)
    db = None
