import sys
import os
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

test_database_path = (Path(tempfile.gettempdir()) / f"antah_pytest_{os.getpid()}.db").as_posix()
os.environ["DATABASE_URL"] = f"sqlite:///{test_database_path}"

from app.db import Base, engine
from app.main import app
import pytest


@pytest.fixture(autouse=True)
def isolated_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides.clear()
    yield
    Base.metadata.drop_all(bind=engine)
