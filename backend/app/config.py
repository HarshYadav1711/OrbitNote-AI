import os
from pathlib import Path
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[2]

_WEAK_JWT_SECRETS = frozenset({"change-me-in-production", "replace-with-a-long-random-string"})


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPO_ROOT / ".env", Path(".env")),
        extra="ignore",
    )

    environment: Literal["development", "production"] = "development"
    database_url: str = "sqlite:///./data/orbitnote.db"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    cookie_name: str = "orbitnote_token"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    cors_origins: str = "http://localhost:5173"
    frontend_origin: str = "http://localhost:5173"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    ollama_timeout_seconds: float = 30.0

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @model_validator(mode="after")
    def apply_production_defaults(self) -> "Settings":
        if self.environment != "production":
            return self

        if "COOKIE_SECURE" not in os.environ:
            self.cookie_secure = True
        if "COOKIE_SAMESITE" not in os.environ:
            self.cookie_samesite = "none"

        if self.jwt_secret in _WEAK_JWT_SECRETS or len(self.jwt_secret) < 16:
            raise ValueError(
                "JWT_SECRET must be at least 16 characters and not a placeholder "
                "when ENVIRONMENT=production"
            )
        return self


settings = Settings()
