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
<<<<<<< HEAD
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./antah.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").lower()
=======
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+pg8000://neondb_owner:npg_mipaIEKo2nV1@ep-restless-moon-begy6uc2.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
>>>>>>> 7864e7550f2a16773e9d6685aef97de15b37fd2e
    JWT_SECRET: str = os.getenv("JWT_SECRET") or secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Nexconn Chat Configuration
    NEXCONN_APP_ID: str = os.getenv("NEXCONN_APP_ID", "")
    NEXCONN_APP_KEY: str = os.getenv("NEXCONN_APP_KEY", "")
    NEXCONN_APP_SECRET: str = os.getenv("NEXCONN_APP_SECRET", "")
    NEXCONN_API_BASE_URL: str = os.getenv("NEXCONN_API_BASE_URL", "https://api.sg-light-api.com").rstrip("/")
    NEXCONN_AREA_CODE: int = int(os.getenv("NEXCONN_AREA_CODE", "2"))
    
    # AI Provider Config
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "anthropic")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
        ).split(",")
        if origin.strip()
    ]

settings = Settings()

if settings.ENVIRONMENT == "production" and not os.getenv("JWT_SECRET"):
    raise RuntimeError("JWT_SECRET must be configured in production.")
