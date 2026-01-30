"""Task database model.

This module defines the Task SQLModel for database persistence.
Phase III: Reused from Phase II for MCP tool integration.
"""

from datetime import datetime
from typing import Literal

from sqlmodel import JSON, Column, Field, SQLModel

# Type alias for priority values
PriorityType = Literal["low", "medium", "high"]


class Task(SQLModel, table=True):
    """Task model for todo items.

    Attributes:
        id: Primary key (auto-generated)
        user_id: Foreign key to User (owner of the task)
        title: Task title/summary (required, max 200 chars)
        description: Optional detailed description (max 1000 chars)
        completed: Completion status (default: False)
        priority: Task priority (low/medium/high, default: medium)
        due_date: Optional deadline for the task
        category: Optional category/label (e.g., Work, Personal)
        tags: List of tags for organization
        position: Order position for drag & drop (default: 0)
        archived: Archive status (default: False)
        reminder_time: When to trigger the reminder/alarm
        reminder_enabled: Whether reminder is active
        snooze_until: If snoozed, when to remind again
        snooze_count: Number of times user has snoozed
        last_reminded_at: When user was last reminded
        created_at: Task creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(max_length=255, index=True)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium", max_length=20)
    due_date: datetime | None = Field(default=None)
    category: str | None = Field(default=None, max_length=50)
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    position: int = Field(default=0, index=True)
    archived: bool = Field(default=False, index=True)

    # Reminder/Alarm fields
    reminder_time: datetime | None = Field(default=None)
    reminder_enabled: bool = Field(default=False)
    snooze_until: datetime | None = Field(default=None)
    snooze_count: int = Field(default=0)
    last_reminded_at: datetime | None = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "title": "Complete Phase III implementation",
                "description": "Implement AI chatbot with MCP tools",
                "completed": False,
                "created_at": "2026-01-15T00:00:00Z",
                "updated_at": "2026-01-15T00:00:00Z",
            }
        }
