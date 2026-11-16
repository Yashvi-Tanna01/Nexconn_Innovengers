import logging
import os
import ssl
import time

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

logger = logging.getLogger("antah.db")


def normalize_database_url(url_str: str) -> str:
    """Normalize PostgreSQL database URL for pure-Python pg8000 driver and SSL."""
    url = url_str.strip().strip('"').strip("'")
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = "postgresql+pg8000://" + url[len("postgresql://"):]
    return url


def build_engine(url_str: str):
    norm_url = normalize_database_url(url_str)
    database_url = make_url(norm_url)

    engine_kwargs = {
        "echo": False,
    }

    if database_url.drivername.startswith("postgresql"):
        query = {
            key: value
            for key, value in database_url.query.items()
            if key not in {"sslmode", "channel_binding"}
        }
        database_url = database_url.set(query=query)
        connect_args = {
            "ssl_context": ssl.create_default_context(),
            "timeout": 15,
        }
        engine_kwargs.update({
            "connect_args": connect_args,
            "pool_size": int(os.getenv("DB_POOL_SIZE", "10")),
            "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "20")),
            "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
            "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "300")),
            "pool_pre_ping": True,
        })
    elif database_url.drivername.startswith("sqlite"):
        engine_kwargs.update({
            "connect_args": {"check_same_thread": False},
        })

    return create_engine(database_url, **engine_kwargs)


engine = build_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_health() -> dict:
    """Perform a live database health check verifying connection and latency."""
    try:
        start_time = time.time()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "connected",
            "dialect": engine.dialect.name,
            "driver": engine.driver,
            "database": engine.url.database or "unknown",
            "latency_ms": latency_ms,
        }
    except Exception as exc:
        logger.error("Database health check error: %s", exc)
        return {
            "status": "error",
            "dialect": engine.dialect.name,
            "database": engine.url.database or "unknown",
            "error": str(exc),
        }


def init_db():
    """Create all tables and perform safe, non-destructive schema migrations."""
    global engine, SessionLocal
    from app import models
    try:
        Base.metadata.create_all(bind=engine)
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())

        # 1. Non-destructive migration for chat_rooms
        if "chat_rooms" in tables:
            columns = {col["name"] for col in inspector.get_columns("chat_rooms")}
            if "nexconn_channel_id" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE chat_rooms ADD COLUMN nexconn_channel_id VARCHAR(64)"))
                    logger.info("Added nexconn_channel_id column to chat_rooms.")

        # 2. Non-destructive migration for reports (latitude, longitude)
        if "reports" in tables:
            columns = {col["name"] for col in inspector.get_columns("reports")}
            with engine.begin() as conn:
                if "latitude" not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN latitude DOUBLE PRECISION"))
                    logger.info("Added latitude column to reports.")
                if "longitude" not in columns:
                    conn.execute(text("ALTER TABLE reports ADD COLUMN longitude DOUBLE PRECISION"))
                    logger.info("Added longitude column to reports.")

        # 3. Non-destructive migration for users (phone, avatar_url, organization)
        if "users" in tables:
            columns = {col["name"] for col in inspector.get_columns("users")}
            with engine.begin() as conn:
                if "phone" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(30)"))
                    logger.info("Added phone column to users.")
                if "avatar_url" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"))
                    logger.info("Added avatar_url column to users.")
                if "organization" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN organization VARCHAR(160)"))
                    logger.info("Added organization column to users.")

        logger.info("Database schema initialized successfully on %s.", engine.url.database)

    except Exception as exc:
        logger.warning("Primary database connection failed: %s. Falling back to local SQLite.", exc)
        if not str(engine.url).startswith("sqlite"):
            engine = build_engine("sqlite:///./antah.db")
            SessionLocal.configure(bind=engine)
            Base.metadata.create_all(bind=engine)
