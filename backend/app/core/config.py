import os
import secrets

from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "ANTAH — The Unheard Signals Network"
    PROJECT_DESCRIPTION: str = "Civic Intelligence Platform for Nexconn Build Challenge 2026"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./antah.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET") or secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Nexconn Chat Configuration
    NEXCONN_APP_ID: str = os.getenv("NEXCONN_APP_ID", "")
    NEXCONN_APP_KEY: str = os.getenv("NEXCONN_APP_KEY", "")
    NEXCONN_APP_SECRET: str = os.getenv("NEXCONN_APP_SECRET", "")
    
    # AI Provider Config
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "anthropic")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

settings = Settings()
