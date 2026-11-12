from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
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
