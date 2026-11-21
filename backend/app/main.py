from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db import init_db, get_db_health
from app.routers.api import router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
)
init_db()

# Ensure uploads directory exists if filesystem allows
try:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (settings.UPLOAD_DIR / "reports").mkdir(parents=True, exist_ok=True)
    if settings.UPLOAD_DIR.exists():
        app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")
        app.mount("/api/v1/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="api_uploads")
except Exception:
    pass

app.include_router(router)

# CORS setup — allow web, mobile apps (Capacitor/WebView/Android), and LAN clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "brand": "ANTAH",
        "name": "The Unheard Signals Network",
        "tagline": "Small signals today. Safer communities tomorrow.",
        "status": "operational",
        "challenge": "Nexconn Build Challenge 2026",
    }

@app.get("/api/v1/health")
def health_check():
    db_health = get_db_health()
    return {
        "status": "healthy" if db_health.get("status") == "connected" else "degraded",
        "service": "ANTAH Core API",
        "version": settings.VERSION,
        "database": db_health,
    }

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

