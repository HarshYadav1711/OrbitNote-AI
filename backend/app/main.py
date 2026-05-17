import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from alembic import command
from alembic.config import Config
from app.api import auth, notes
from app.config import settings
from app.database import ensure_sqlite_directory


def run_migrations() -> None:
    if os.getenv("DISABLE_MIGRATIONS"):
        return
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(_: FastAPI):
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
app.include_router(notes.router)


@app.get("/health")
def health():
    return {"status": "ok"}
