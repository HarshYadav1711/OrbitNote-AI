from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AIGenerateRequest(BaseModel):
    content: str | None = None
    title: str | None = None


class ActionItem(BaseModel):
    text: str
    done: bool = False


class AISummaryResult(BaseModel):
    summary: str
    bullets: list[str] = Field(default_factory=list)


class AIActionsResult(BaseModel):
    items: list[ActionItem] = Field(default_factory=list)


class AITitleResult(BaseModel):
    title: str


class AIGenerateResponse(BaseModel):
    type: str
    provider: str
    status: str
    history_id: int
    result: AISummaryResult | AIActionsResult | AITitleResult


class AIHistoryResponse(BaseModel):
    id: int
    note_id: int
    type: str
    provider: str
    status: str
    result: dict[str, Any] | None
    error_message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
