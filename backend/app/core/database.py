from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Initialize MongoDB client
try:
    client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.aegis # Database name 'aegis'
    print("MongoDB connection established successfully.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

# Async helper to check ping
async def ping_db():
    if client:
        try:
            await client.admin.command('ping')
            return True
        except Exception:
            return False
    return False
