"""Task database model.

This module defines the Task SQLModel for database persistence.
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
        created_at: Task creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: str = Field(default="medium", max_length=20)
    due_date: datetime | None = Field(default=None)
    category: str | None = Field(default=None, max_length=50)
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    position: int = Field(default=0, index=True)
    archived: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "title": "Complete Phase II implementation",
                "description": "Implement backend and frontend for web todo app",
                "completed": False,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            }
        }
