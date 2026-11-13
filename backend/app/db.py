import logging
import ssl

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

logger = logging.getLogger("antah.db")

def build_engine(url_str: str):
    database_url = make_url(url_str)
    if database_url.drivername == "postgresql+pg8000":
        query = {
            key: value
            for key, value in database_url.query.items()
            if key not in {"sslmode", "channel_binding"}
        }
        database_url = database_url.set(query=query)
        connect_args = {"ssl_context": ssl.create_default_context(), "timeout": 15}
    elif database_url.drivername.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    else:
        connect_args = {}
    return create_engine(database_url, connect_args=connect_args)

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

def init_db():
    global engine, SessionLocal
    from app import models
    try:
        Base.metadata.create_all(bind=engine)
        if "chat_rooms" in inspect(engine).get_table_names():
            columns = {column["name"] for column in inspect(engine).get_columns("chat_rooms")}
            if "nexconn_channel_id" not in columns:
                with engine.begin() as connection:
                    connection.execute(text("ALTER TABLE chat_rooms ADD COLUMN nexconn_channel_id VARCHAR(64)"))
    except Exception as exc:
        logger.warning("Primary database connection failed: %s. Falling back to local SQLite.", exc)
        if not str(engine.url).startswith("sqlite"):
            engine = build_engine("sqlite:///./antah.db")
            SessionLocal.configure(bind=engine)
            Base.metadata.create_all(bind=engine)

