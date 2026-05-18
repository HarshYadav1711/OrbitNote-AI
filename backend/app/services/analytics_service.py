from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import AIHistory, Note, NoteTag, Tag


def _week_start() -> datetime:
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return today - timedelta(days=6)


def get_dashboard(db: Session, user_id: int) -> dict:
    total_notes = (
        db.query(func.count(Note.id))
        .filter(Note.user_id == user_id, Note.is_archived.is_(False))
        .scalar()
        or 0
    )
    archived_notes = (
        db.query(func.count(Note.id))
        .filter(Note.user_id == user_id, Note.is_archived.is_(True))
        .scalar()
        or 0
    )

    recent = (
        db.query(Note)
        .filter(Note.user_id == user_id, Note.is_archived.is_(False))
        .order_by(Note.updated_at.desc())
        .limit(5)
        .all()
    )

    top_tags = (
        db.query(Tag.name, func.count(NoteTag.note_id).label("cnt"))
        .join(NoteTag, NoteTag.tag_id == Tag.id)
        .join(Note, Note.id == NoteTag.note_id)
        .filter(Note.user_id == user_id, Note.is_archived.is_(False))
        .group_by(Tag.name)
        .order_by(func.count(NoteTag.note_id).desc())
        .limit(8)
        .all()
    )

    ai_total = (
        db.query(func.count(AIHistory.id)).filter(AIHistory.user_id == user_id).scalar() or 0
    )
    week_start = _week_start()
    ai_last_7 = (
        db.query(func.count(AIHistory.id))
        .filter(AIHistory.user_id == user_id, AIHistory.created_at >= week_start)
        .scalar()
        or 0
    )
    ai_by_type_rows = (
        db.query(AIHistory.type, func.count(AIHistory.id))
        .filter(AIHistory.user_id == user_id)
        .group_by(AIHistory.type)
        .all()
    )
    ai_by_type = {row[0]: row[1] for row in ai_by_type_rows}

    weekly_activity = []
    for offset in range(6, -1, -1):
        day_start = week_start + timedelta(days=offset)
        day_end = day_start + timedelta(days=1)
        day_label = day_start.strftime("%Y-%m-%d")
        notes_updated = (
            db.query(func.count(Note.id))
            .filter(
                Note.user_id == user_id,
                Note.updated_at >= day_start,
                Note.updated_at < day_end,
            )
            .scalar()
            or 0
        )
        ai_requests = (
            db.query(func.count(AIHistory.id))
            .filter(
                AIHistory.user_id == user_id,
                AIHistory.created_at >= day_start,
                AIHistory.created_at < day_end,
            )
            .scalar()
            or 0
        )
        weekly_activity.append(
            {
                "date": day_label,
                "notes_updated": notes_updated,
                "ai_requests": ai_requests,
            }
        )

    return {
        "total_notes": total_notes,
        "archived_notes": archived_notes,
        "recently_edited": [
            {"id": n.id, "title": n.title, "updated_at": n.updated_at} for n in recent
        ],
        "top_tags": [{"name": name, "count": cnt} for name, cnt in top_tags],
        "ai_usage": {
            "total_requests": ai_total,
            "by_type": ai_by_type,
            "last_7_days": ai_last_7,
        },
        "weekly_activity": weekly_activity,
    }
