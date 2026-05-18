from datetime import datetime

from pydantic import BaseModel

from app.schemas.note import TagResponse


class PublicNoteResponse(BaseModel):
    title: str
    content: str
    category: str | None
    tags: list[TagResponse]
    updated_at: datetime

    model_config = {"from_attributes": True}


class ShareLinkResponse(BaseModel):
    is_public: bool
    share_token: str | None
    share_url: str | None
