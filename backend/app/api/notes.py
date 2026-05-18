from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.logging_config import get_logger, log_event
from app.models import Note, User
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate
from app.schemas.share import ShareLinkResponse
from app.services.note_service import get_user_note, list_notes, sync_tags
from app.services.share_service import disable_sharing, enable_sharing

router = APIRouter(prefix="/notes", tags=["notes"])
logger = get_logger(__name__)


def _serialize(note: Note) -> NoteResponse:
    return NoteResponse.model_validate(note)


@router.get("", response_model=list[NoteResponse])
def get_notes(
    q: str | None = Query(default=None, max_length=200),
    tag: str | None = Query(default=None, max_length=80),
    category: str | None = Query(default=None, max_length=80),
    archived: bool = Query(default=False),
    sort: str = Query(default="updated_desc", pattern="^(updated_desc|updated_asc)$"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notes = list_notes(db, user.id, q=q, tag=tag, category=category, archived=archived, sort=sort)
    return [_serialize(n) for n in notes]


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = Note(
        user_id=user.id,
        title=payload.title.strip() or "Untitled",
        content=payload.content,
        category=payload.category.strip() if payload.category else None,
    )
    db.add(note)
    db.flush()
    sync_tags(db, note, payload.tags)
    db.commit()
    db.refresh(note)
    return _serialize(note)


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: Annotated[int, Path(ge=1)],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return _serialize(note)


@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: Annotated[int, Path(ge=1)],
    payload: NoteUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if payload.title is not None:
        note.title = payload.title.strip()
    if payload.content is not None:
        note.content = payload.content
    if payload.category is not None:
        note.category = payload.category.strip() or None
    if payload.is_archived is not None:
        note.is_archived = payload.is_archived
    if payload.tags is not None:
        sync_tags(db, note, payload.tags)
    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    return _serialize(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: Annotated[int, Path(ge=1)],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    db.delete(note)
    db.commit()


def _share_url(token: str | None) -> str | None:
    if not token:
        return None
    return f"{settings.frontend_origin.rstrip('/')}/share/{token}"


@router.post("/{note_id}/share", response_model=ShareLinkResponse)
def enable_note_share(
    note_id: Annotated[int, Path(ge=1)],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    enable_sharing(db, note)
    db.commit()
    db.refresh(note)
    log_event(logger, "share.enable", user_id=user.id, note_id=note.id)
    return ShareLinkResponse(
        is_public=True,
        share_token=note.share_token,
        share_url=_share_url(note.share_token),
    )


@router.delete("/{note_id}/share", response_model=ShareLinkResponse)
def disable_note_share(
    note_id: Annotated[int, Path(ge=1)],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = get_user_note(db, user.id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    disable_sharing(db, note)
    db.commit()
    db.refresh(note)
    log_event(logger, "share.disable", user_id=user.id, note_id=note.id)
    return ShareLinkResponse(is_public=False, share_token=None, share_url=None)
