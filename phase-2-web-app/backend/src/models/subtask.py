"""Subtask database model.

This module defines the Subtask SQLModel for checklist items within tasks.
"""

from datetime import datetime

from sqlmodel import Field, SQLModel


class Subtask(SQLModel, table=True):
    """Subtask model for checklist items.

    Attributes:
        id: Primary key (auto-generated)
        task_id: Foreign key to Task (parent task)
        title: Subtask title (required, max 200 chars)
        completed: Completion status (default: False)
        position: Order position (default: 0)
        created_at: Subtask creation timestamp
        updated_at: Last modification timestamp
    """

    __tablename__ = "subtasks"

    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True, ondelete="CASCADE")
    title: str = Field(min_length=1, max_length=200)
    completed: bool = Field(default=False)
    position: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "id": 1,
                "task_id": 1,
                "title": "Research best practices",
                "completed": False,
                "position": 0,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            }
        }
