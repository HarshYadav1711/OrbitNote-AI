from datetime import datetime

from pydantic import BaseModel, Field


class TagResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class NoteCreate(BaseModel):
    title: str = Field(default="Untitled", max_length=255)
    content: str = Field(default="", max_length=500_000)
    category: str | None = Field(default=None, max_length=80)
    tags: list[str] = Field(default_factory=list, max_length=50)


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    content: str | None = Field(default=None, max_length=500_000)
    category: str | None = Field(default=None, max_length=80)
    tags: list[str] | None = Field(default=None, max_length=50)
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
