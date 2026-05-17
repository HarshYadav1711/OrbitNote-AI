from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.models import Note, Tag


def sync_tags(db: Session, note: Note, tag_names: list[str]) -> None:
    cleaned = sorted({t.strip().lower() for t in tag_names if t.strip()})
    note.tags.clear()
    for name in cleaned:
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()
        note.tags.append(tag)


def note_to_dict_tags(note: Note) -> list:
    return note.tags


def get_user_note(db: Session, user_id: int, note_id: int) -> Note | None:
    return (
        db.query(Note)
        .options(joinedload(Note.tags))
        .filter(Note.id == note_id, Note.user_id == user_id)
        .first()
    )


def list_notes(
    db: Session,
    user_id: int,
    *,
    q: str | None = None,
    tag: str | None = None,
    category: str | None = None,
    archived: bool = False,
    sort: str = "updated_desc",
) -> list[Note]:
    query = (
        db.query(Note)
        .options(joinedload(Note.tags))
        .filter(Note.user_id == user_id, Note.is_archived == archived)
    )
    if q:
        pattern = f"%{q.lower()}%"
        query = query.filter(
            or_(func.lower(Note.title).like(pattern), func.lower(Note.content).like(pattern))
        )
    if category:
        query = query.filter(func.lower(Note.category) == category.lower())
    if tag:
        query = query.join(Note.tags).filter(func.lower(Tag.name) == tag.lower())
    if sort == "updated_asc":
        query = query.order_by(Note.updated_at.asc())
    else:
        query = query.order_by(Note.updated_at.desc())
    return query.all()
