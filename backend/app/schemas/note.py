from datetime import datetime

from pydantic import BaseModel


class TagResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class NoteCreate(BaseModel):
    title: str = "Untitled"
    content: str = ""
    category: str | None = None
    tags: list[str] = []


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    is_archived: bool | None = None


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str | None
    is_archived: bool
    is_public: bool
    share_token: str | None
    tags: list[TagResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
