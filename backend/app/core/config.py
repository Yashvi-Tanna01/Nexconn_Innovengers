import os
import secrets

from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()


class Settings:
    PROJECT_NAME: str = "ANTAH — The Unheard Signals Network"
    PROJECT_DESCRIPTION: str = "Civic Intelligence Platform for Nexconn Build Challenge 2026"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./antah.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").lower()
    JWT_SECRET: str = os.getenv("JWT_SECRET") or secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    NEXCONN_APP_ID: str = os.getenv("NEXCONN_APP_ID", "")
    NEXCONN_APP_KEY: str = os.getenv("NEXCONN_APP_KEY", "")
    NEXCONN_APP_SECRET: str = os.getenv("NEXCONN_APP_SECRET", "")
    NEXCONN_API_BASE_URL: str = os.getenv(
        "NEXCONN_API_BASE_URL", "https://api.sg-light-api.com"
    ).rstrip("/")
    NEXCONN_AREA_CODE: int = int(os.getenv("NEXCONN_AREA_CODE", "2"))

    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "anthropic")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")

    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))).resolve()
    MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024))) # 10MB default

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
