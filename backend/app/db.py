import ssl

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

database_url = make_url(settings.DATABASE_URL)
if database_url.drivername == "postgresql+pg8000":
    query = {
        key: value
        for key, value in database_url.query.items()
        if key not in {"sslmode", "channel_binding"}
    }
    database_url = database_url.set(query=query)
    connect_args = {"ssl_context": ssl.create_default_context()}
elif database_url.drivername.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(database_url, connect_args=connect_args)
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
    from app import models
    Base.metadata.create_all(bind=engine)
    if "chat_rooms" in inspect(engine).get_table_names():
        columns = {column["name"] for column in inspect(engine).get_columns("chat_rooms")}
        if "nexconn_channel_id" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE chat_rooms ADD COLUMN nexconn_channel_id VARCHAR(64)"))
