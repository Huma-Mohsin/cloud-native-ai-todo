"""Task request/response schemas.

Phase III: Minimal schemas needed for MCP tools.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class CreateTaskRequest(BaseModel):
    """Request schema for creating a task."""

    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    priority: str = Field(default="medium")
    due_date: datetime | None = None
    category: str | None = None
    tags: list[str] = Field(default_factory=list)


class UpdateTaskRequest(BaseModel):
    """Request schema for updating a task."""

    title: str | None = None
    description: str | None = None
    completed: bool | None = None
    priority: str | None = None
    due_date: datetime | None = None
    category: str | None = None
    tags: list[str] | None = None
    position: int | None = None
    archived: bool | None = None

    # Reminder fields
    reminder_time: datetime | None = None
    reminder_enabled: bool | None = None
    snooze_until: datetime | None = None
    snooze_count: int | None = None
