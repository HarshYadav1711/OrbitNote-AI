from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from alembic import command
from alembic.config import Config
from app.api import ai, analytics, auth, notes, public
from app.config import settings
from app.database import ensure_sqlite_directory, get_db
from app.logging_config import configure_logging, get_logger

logger = get_logger(__name__)


def run_migrations() -> None:
    if settings.disable_migrations:
        return
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
    except Exception:
        logger.exception("Migration failed during startup")
        raise


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    logger.info(
        "startup environment=%s database=%s",
        settings.environment,
        "sqlite" if settings.is_sqlite else "other",
    )
    ensure_sqlite_directory()
    run_migrations()
    yield


app = FastAPI(title="OrbitNote API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(public.router)
app.include_router(notes.router)
app.include_router(ai.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.environment}


@app.get("/health/ready")
def health_ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="database unavailable") from exc
    return {"status": "ok", "database": "ok"}
