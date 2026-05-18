from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.logging_config import get_logger, log_event
from app.models import User
from app.schemas.ai import AIGenerateRequest, AIGenerateResponse, AIHistoryResponse
from app.services.ai import service as ai_service
from app.services.note_service import get_user_note

router = APIRouter(prefix="/notes", tags=["ai"])
logger = get_logger(__name__)


def _resolve_content(note, payload: AIGenerateRequest) -> tuple[str, str, str | None]:
    content = payload.content if payload.content is not None else note.content
    title = payload.title if payload.title is not None else note.title
    if payload.category is not None:
        category = payload.category.strip() or None
    else:
        category = note.category
    return content, title, category


@router.post("/{note_id}/ai/summary", response_model=AIGenerateResponse)
async def generate_summary(
    note_id: Annotated[int, Path(ge=1)],
    payload: AIGenerateRequest = AIGenerateRequest(),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    content, title, category = _resolve_content(note, payload)
    result = await ai_service.generate_summary(db, note, user.id, content, title, category=category)
    log_event(logger, "ai.summary", user_id=user.id, note_id=note_id, provider=result.provider)
    return result


@router.post("/{note_id}/ai/actions", response_model=AIGenerateResponse)
async def extract_actions(
    note_id: Annotated[int, Path(ge=1)],
    payload: AIGenerateRequest = AIGenerateRequest(),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    content, title, category = _resolve_content(note, payload)
    result = await ai_service.extract_actions(db, note, user.id, content, title, category=category)
    log_event(logger, "ai.actions", user_id=user.id, note_id=note_id, provider=result.provider)
    return result


@router.post("/{note_id}/ai/title", response_model=AIGenerateResponse)
async def suggest_title(
    note_id: Annotated[int, Path(ge=1)],
    payload: AIGenerateRequest = AIGenerateRequest(),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    content, title, category = _resolve_content(note, payload)
    result = await ai_service.suggest_title(db, note, user.id, content, title, category=category)
    log_event(logger, "ai.title", user_id=user.id, note_id=note_id, provider=result.provider)
    return result


@router.get("/{note_id}/ai/history", response_model=list[AIHistoryResponse])
def get_ai_history(
    note_id: Annotated[int, Path(ge=1)],
    limit: int = Query(default=20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return ai_service.list_history(db, note_id, limit=limit)
