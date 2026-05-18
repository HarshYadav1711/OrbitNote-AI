from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.logging_config import get_logger, log_event
from app.schemas.share import PublicNoteResponse
from app.services.share_service import get_public_note
from app.validators import SHARE_TOKEN_PATTERN

router = APIRouter(prefix="/public", tags=["public"])
logger = get_logger(__name__)


@router.get("/notes/{share_token}", response_model=PublicNoteResponse)
def read_public_note(share_token: str, db: Session = Depends(get_db)):
    if not SHARE_TOKEN_PATTERN.match(share_token):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This shared note is not available",
        )
    note = get_public_note(db, share_token)
    if not note:
        log_event(logger, "share.public_miss", token_prefix=share_token[:8])
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This shared note is not available",
        )
    log_event(logger, "share.public_read", note_id=note.id)
    return PublicNoteResponse.model_validate(note)
