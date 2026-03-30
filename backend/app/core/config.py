import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# 1. Manually build the absolute path to backend/.env
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.abspath(os.path.join(current_dir, "../../.env"))

# 2. Force load the environment variables into the OS BEFORE Pydantic runs
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareFlow AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # AI Environment
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

# 3. Initialize (Pydantic will now read seamlessly from the OS environment)
settings = Settings()