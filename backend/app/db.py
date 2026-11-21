import logging
import ssl
import time

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

logger = logging.getLogger("antah.db")

def build_engine(url_str: str):
    # Normalize legacy postgres:// and bare postgresql:// to driver-specific postgresql+pg8000://
    if url_str.startswith("postgres://"):
        url_str = url_str.replace("postgres://", "postgresql+pg8000://", 1)
    elif url_str.startswith("postgresql://") and not url_str.startswith("postgresql+"):
        url_str = url_str.replace("postgresql://", "postgresql+pg8000://", 1)

    database_url = make_url(url_str)
    if database_url.drivername == "postgresql+pg8000":
        query = {
            key: value
            for key, value in database_url.query.items()
            if key not in {"sslmode", "channel_binding"}
        }
        database_url = database_url.set(query=query)
        connect_args = {"ssl_context": ssl.create_default_context(), "timeout": 20}
        return create_engine(
            database_url,
            connect_args=connect_args,
            pool_size=10,
            max_overflow=20,
            pool_timeout=30,
            pool_pre_ping=True,
            pool_recycle=280,
        )
    elif database_url.drivername.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        return create_engine(database_url, connect_args=connect_args)
    else:
        connect_args = {}
        return create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)

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


def _ensure_schema_migrations(target_engine):
    """Automatically synchronizes schema changes without deleting existing data."""
    migrations = {
        "users": {
            "phone": "VARCHAR(30)",
            "avatar_url": "VARCHAR(500)",
            "organization": "VARCHAR(160)",
        },
        "chat_rooms": {
            "nexconn_channel_id": "VARCHAR(64)",
        },
        "reports": {
            "latitude": "FLOAT",
            "longitude": "FLOAT",
        },
    }
    with target_engine.begin() as connection:
        inspector = inspect(connection)
        existing_tables = set(inspector.get_table_names())
        for table_name, columns in migrations.items():
            if table_name in existing_tables:
                existing_cols = {col["name"] for col in inspector.get_columns(table_name)}
                for col_name, col_type in columns.items():
                    if col_name not in existing_cols:
                        logger.info("Applying schema migration to %s: ADD COLUMN %s", table_name, col_name)
                        connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}"))


def init_db():
    global engine, SessionLocal
    from app import models
    try:
        Base.metadata.create_all(bind=engine)
        _ensure_schema_migrations(engine)
    except Exception as exc:
        logger.warning("Primary database connection failed: %s. Falling back to local SQLite.", exc)
        if not str(engine.url).startswith("sqlite"):
            engine = build_engine("sqlite:///./antah.db")
            SessionLocal.configure(bind=engine)
            Base.metadata.create_all(bind=engine)
            _ensure_schema_migrations(engine)

