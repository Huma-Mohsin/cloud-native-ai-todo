"""Subtask API schemas for request/response validation.

This module defines Pydantic schemas for subtask-related API operations.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CreateSubtaskRequest(BaseModel):
    """Request schema for creating a subtask.

    Attributes:
        title: Subtask title (1-200 characters)
    """

    title: str = Field(min_length=1, max_length=200, description="Subtask title")

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "title": "Research best practices",
            }
        }


class UpdateSubtaskRequest(BaseModel):
    """Request schema for updating a subtask.

    All fields are optional to support partial updates.

    Attributes:
        title: Updated subtask title
        completed: Updated completion status
        position: Updated position
    """

    title: Optional[str] = Field(
        default=None, min_length=1, max_length=200, description="Updated subtask title"
    )
    completed: Optional[bool] = Field(
        default=None, description="Updated completion status"
    )
    position: Optional[int] = Field(default=None, description="Updated position")

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "title": "Research and document best practices",
                "completed": True,
            }
        }


class SubtaskResponse(BaseModel):
    """Response schema for subtask data.

    Attributes:
        id: Subtask ID
        task_id: Parent task ID
        title: Subtask title
        completed: Completion status
        position: Display position
        created_at: Creation timestamp
        updated_at: Last modification timestamp
    """

    id: int
    task_id: int
    title: str
    completed: bool
    position: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic model configuration."""

        from_attributes = True
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
