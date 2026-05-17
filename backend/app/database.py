from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

connect_args = {"check_same_thread": False} if settings.is_sqlite else {}
engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_sqlite_directory() -> None:
    if not settings.is_sqlite:
        return
    # sqlite:///./data/orbitnote.db -> ./data
    raw = settings.database_url.removeprefix("sqlite:///")
    db_path = Path(raw)
    if db_path.parent and str(db_path.parent) not in (".", ""):
        db_path.parent.mkdir(parents=True, exist_ok=True)
