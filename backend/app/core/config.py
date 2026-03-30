from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aegis Health OS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # AI Environment
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile" # Fast, versatile reasoning

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()