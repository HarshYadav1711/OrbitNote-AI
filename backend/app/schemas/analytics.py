from datetime import datetime

from pydantic import BaseModel


class RecentlyEditedNote(BaseModel):
    id: int
    title: str
    updated_at: datetime


class TagUsage(BaseModel):
    name: str
    count: int


class AIUsageStats(BaseModel):
    total_requests: int
    by_type: dict[str, int]
    last_7_days: int


class WeeklyActivityDay(BaseModel):
    date: str
    notes_updated: int
    ai_requests: int


class DashboardResponse(BaseModel):
    total_notes: int
    archived_notes: int
    shared_notes: int
    ai_assisted_notes: int
    recently_edited: list[RecentlyEditedNote]
    top_tags: list[TagUsage]
    ai_usage: AIUsageStats
    weekly_activity: list[WeeklyActivityDay]
