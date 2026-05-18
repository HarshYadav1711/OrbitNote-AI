import os

import pytest
from pydantic import ValidationError

from app.config import Settings


def test_cors_origin_list_parses_comma_separated():
    s = Settings(cors_origins="https://a.com, https://b.com ")
    assert s.cors_origin_list == ["https://a.com", "https://b.com"]


def test_production_requires_strong_jwt_secret(monkeypatch):
    monkeypatch.delenv("COOKIE_SECURE", raising=False)
    monkeypatch.delenv("COOKIE_SAMESITE", raising=False)
    with pytest.raises(ValidationError):
        Settings(environment="production", jwt_secret="change-me-in-production")


def test_production_applies_cookie_defaults(monkeypatch):
    monkeypatch.delenv("COOKIE_SECURE", raising=False)
    monkeypatch.delenv("COOKIE_SAMESITE", raising=False)
    s = Settings(environment="production", jwt_secret="a-secure-production-secret-key")
    assert s.cookie_secure is True
    assert s.cookie_samesite == "none"


def test_production_respects_explicit_cookie_env(monkeypatch):
    monkeypatch.setenv("COOKIE_SECURE", "false")
    monkeypatch.setenv("COOKIE_SAMESITE", "lax")
    s = Settings(environment="production", jwt_secret="a-secure-production-secret-key")
    assert s.cookie_secure is False
    assert s.cookie_samesite == "lax"
