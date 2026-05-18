import secrets

from sqlalchemy.orm import Session, joinedload

from app.models import Note


def generate_share_token() -> str:
    return secrets.token_urlsafe(32)


def get_public_note(db: Session, share_token: str) -> Note | None:
    return (
        db.query(Note)
        .options(joinedload(Note.tags))
        .filter(
            Note.share_token == share_token,
            Note.is_public.is_(True),
            Note.is_archived.is_(False),
        )
        .first()
    )


def enable_sharing(db: Session, note: Note) -> Note:
    if not note.share_token:
        note.share_token = generate_share_token()
    note.is_public = True
    return note


def disable_sharing(db: Session, note: Note) -> Note:
    note.is_public = False
    note.share_token = None
    return note
