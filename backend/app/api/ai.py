from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.ai import AIGenerateRequest, AIGenerateResponse, AIHistoryResponse
from app.services.note_service import get_user_note
from app.services.ai import service as ai_service

router = APIRouter(prefix="/notes", tags=["ai"])


def _resolve_content(note, payload: AIGenerateRequest) -> tuple[str, str]:
    content = payload.content if payload.content is not None else note.content
    title = payload.title if payload.title is not None else note.title
    return content, title


@router.post("/{note_id}/ai/summary", response_model=AIGenerateResponse)
async def generate_summary(
    note_id: int,
    payload: AIGenerateRequest = AIGenerateRequest(),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    content, title = _resolve_content(note, payload)
    return await ai_service.generate_summary(db, note, user.id, content, title)


@router.post("/{note_id}/ai/actions", response_model=AIGenerateResponse)
async def extract_actions(
    note_id: int,
    payload: AIGenerateRequest = AIGenerateRequest(),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    content, title = _resolve_content(note, payload)
    return await ai_service.extract_actions(db, note, user.id, content, title)


@router.post("/{note_id}/ai/title", response_model=AIGenerateResponse)
async def suggest_title(
    note_id: int,
    payload: AIGenerateRequest = AIGenerateRequest(),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    content, title = _resolve_content(note, payload)
    return await ai_service.suggest_title(db, note, user.id, content, title)


@router.get("/{note_id}/ai/history", response_model=list[AIHistoryResponse])
def get_ai_history(
    note_id: int,
    limit: int = Query(default=20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return ai_service.list_history(db, note_id, limit=limit)
