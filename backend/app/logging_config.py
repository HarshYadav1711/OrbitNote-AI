import logging
import os
from typing import Any

_CONFIGURED = False


def configure_logging() -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    configure_logging()
    return logging.getLogger(name)


def log_event(logger: logging.Logger, event: str, **fields: Any) -> None:
    """Lightweight structured log line: event key=value pairs."""
    if not fields:
        logger.info(event)
        return
    parts = " ".join(f"{k}={v!r}" for k, v in sorted(fields.items()))
    logger.info("%s %s", event, parts)
