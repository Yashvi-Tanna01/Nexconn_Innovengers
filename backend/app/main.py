from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db import init_db
from app.routers.api import router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
)
init_db()
app.include_router(router)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
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
    return {
        "status": "healthy",
        "service": "ANTAH Core API",
        "version": settings.VERSION,
    }
