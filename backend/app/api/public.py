from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.share import PublicNoteResponse
from app.services.share_service import get_public_note

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/notes/{share_token}", response_model=PublicNoteResponse)
def read_public_note(share_token: str, db: Session = Depends(get_db)):
    note = get_public_note(db, share_token)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This shared note is not available",
        )
    return PublicNoteResponse.model_validate(note)
