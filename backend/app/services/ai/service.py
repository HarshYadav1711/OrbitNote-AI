import json

from sqlalchemy.orm import Session

from app.models import AIHistory, Note
from app.schemas.ai import (
    AIActionsResult,
    AIGenerateResponse,
    AIHistoryResponse,
    AISummaryResult,
    AITitleResult,
)
from app.services.ai import fallback, ollama
from app.services.ai.context import normalize_category

AI_TYPE_SUMMARY = "summary"
AI_TYPE_ACTIONS = "actions"
AI_TYPE_TITLE = "title"


def _record_history(
    db: Session,
    *,
    note: Note,
    user_id: int,
    ai_type: str,
    provider: str,
    status: str,
    result: AISummaryResult | AIActionsResult | AITitleResult | None = None,
    error_message: str | None = None,
) -> AIHistory:
    entry = AIHistory(
        note_id=note.id,
        user_id=user_id,
        type=ai_type,
        provider=provider,
        status=status,
        result_json=json.dumps(result.model_dump()) if result else None,
        error_message=error_message,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


async def _try_ollama_summary(
    content: str, title: str, category: str | None
) -> AISummaryResult | None:
    if await ollama.is_available():
        return await ollama.generate_summary(content, title, category)
    return None


async def _try_ollama_actions(
    content: str, title: str, category: str | None
) -> AIActionsResult | None:
    if await ollama.is_available():
        return await ollama.extract_actions(content, title, category)
    return None


async def _try_ollama_title(
    content: str, title: str, category: str | None
) -> AITitleResult | None:
    if await ollama.is_available():
        return await ollama.suggest_title(content, title, category)
    return None


async def generate_summary(
    db: Session,
    note: Note,
    user_id: int,
    content: str,
    title: str,
    category: str | None = None,
) -> AIGenerateResponse:
    cat = normalize_category(category if category is not None else note.category)
    result = await _try_ollama_summary(content, title, cat)
    provider = "ollama" if result else "fallback"
    if result is None:
        result = fallback.generate_summary(content, title, cat)
    entry = _record_history(
        db,
        note=note,
        user_id=user_id,
        ai_type=AI_TYPE_SUMMARY,
        provider=provider,
        status="success",
        result=result,
    )
    return AIGenerateResponse(
        type=AI_TYPE_SUMMARY,
        provider=provider,
        status="success",
        history_id=entry.id,
        result=result,
    )


async def extract_actions(
    db: Session,
    note: Note,
    user_id: int,
    content: str,
    title: str,
    category: str | None = None,
) -> AIGenerateResponse:
    cat = normalize_category(category if category is not None else note.category)
    result = await _try_ollama_actions(content, title, cat)
    provider = "ollama" if result else "fallback"
    if result is None:
        result = fallback.extract_actions(content, title, cat)
    entry = _record_history(
        db,
        note=note,
        user_id=user_id,
        ai_type=AI_TYPE_ACTIONS,
        provider=provider,
        status="success",
        result=result,
    )
    return AIGenerateResponse(
        type=AI_TYPE_ACTIONS,
        provider=provider,
        status="success",
        history_id=entry.id,
        result=result,
    )


async def suggest_title(
    db: Session,
    note: Note,
    user_id: int,
    content: str,
    title: str,
    category: str | None = None,
) -> AIGenerateResponse:
    cat = normalize_category(category if category is not None else note.category)
    result = await _try_ollama_title(content, title, cat)
    provider = "ollama" if result else "fallback"
    if result is None:
        result = fallback.suggest_title(content, title, cat)
    entry = _record_history(
        db,
        note=note,
        user_id=user_id,
        ai_type=AI_TYPE_TITLE,
        provider=provider,
        status="success",
        result=result,
    )
    return AIGenerateResponse(
        type=AI_TYPE_TITLE,
        provider=provider,
        status="success",
        history_id=entry.id,
        result=result,
    )


def list_history(db: Session, note_id: int, limit: int = 20) -> list[AIHistoryResponse]:
    rows = (
        db.query(AIHistory)
        .filter(AIHistory.note_id == note_id)
        .order_by(AIHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    out: list[AIHistoryResponse] = []
    for row in rows:
        parsed = None
        if row.result_json:
            try:
                parsed = json.loads(row.result_json)
            except json.JSONDecodeError:
                parsed = None
        out.append(
            AIHistoryResponse(
                id=row.id,
                note_id=row.note_id,
                type=row.type,
                provider=row.provider,
                status=row.status,
                result=parsed,
                error_message=row.error_message,
                created_at=row.created_at,
            )
        )
    return out
