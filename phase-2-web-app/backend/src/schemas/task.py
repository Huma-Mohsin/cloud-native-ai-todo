"""Task API schemas for request/response validation.

This module defines Pydantic schemas for task-related API operations.
"""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field

# Type alias for priority values
PriorityType = Literal["low", "medium", "high"]


class SubtaskSchema(BaseModel):
    """Schema for subtask data."""
    id: Optional[int] = None
    title: str = Field(min_length=1, max_length=200)
    completed: bool = False
    position: int = 0


class CreateTaskRequest(BaseModel):
    """Request schema for creating a task.

    Attributes:
        title: Task title (1-200 characters)
        description: Optional task description (max 1000 characters)
        priority: Task priority (low/medium/high)
        due_date: Optional deadline
        category: Optional category label
        tags: List of tags
    """

    title: str = Field(min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(
        default=None, max_length=1000, description="Optional task description"
    )
    priority: Optional[str] = Field(default="medium", description="Task priority (low/medium/high)")
    due_date: Optional[datetime] = Field(default=None, description="Optional deadline")
    category: Optional[str] = Field(default=None, max_length=50, description="Task category")
    tags: Optional[List[str]] = Field(default_factory=list, description="Task tags")

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "title": "Complete Phase II implementation",
                "description": "Implement backend and frontend for web todo app",
                "priority": "high",
                "due_date": "2024-12-31T23:59:59Z",
                "category": "Work",
                "tags": ["development", "urgent"]
            }
        }


class UpdateTaskRequest(BaseModel):
    """Request schema for updating a task.

    All fields are optional to support partial updates.

    Attributes:
        title: Updated task title (1-200 characters)
        description: Updated task description (max 1000 characters, can be null)
        completed: Updated completion status
        priority: Updated priority level
        due_date: Updated deadline
        category: Updated category
        tags: Updated tags list
        position: Updated position for drag & drop
        archived: Archive status
    """

    title: Optional[str] = Field(
        default=None, min_length=1, max_length=200, description="Updated task title"
    )
    description: Optional[str] = Field(
        default=None, max_length=1000, description="Updated task description"
    )
    completed: Optional[bool] = Field(
        default=None, description="Updated completion status"
    )
    priority: Optional[str] = Field(default=None, description="Updated priority (low/medium/high)")
    due_date: Optional[datetime] = Field(default=None, description="Updated deadline")
    category: Optional[str] = Field(default=None, max_length=50, description="Updated category")
    tags: Optional[List[str]] = Field(default=None, description="Updated tags")
    position: Optional[int] = Field(default=None, description="Updated position")
    archived: Optional[bool] = Field(default=None, description="Archive status")

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "title": "Complete Phase II implementation (Updated)",
                "description": "Implement backend, frontend, and tests",
                "completed": True,
                "priority": "medium",
                "category": "Development"
            }
        }


class TaskResponse(BaseModel):
    """Response schema for task data.

    Attributes:
        id: Task ID
        user_id: Owner user ID
        title: Task title
        description: Task description (optional)
        completed: Completion status
        priority: Task priority
        due_date: Task deadline (optional)
        category: Task category (optional)
        tags: Task tags
        position: Task position
        archived: Archive status
        subtasks: List of subtasks
        created_at: Task creation timestamp
        updated_at: Last modification timestamp
    """

    id: int
    user_id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: str
    due_date: Optional[datetime]
    category: Optional[str]
    tags: List[str]
    position: int
    archived: bool
    subtasks: Optional[List[SubtaskSchema]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic model configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "title": "Complete Phase II implementation",
                "description": "Implement backend and frontend for web todo app",
                "completed": False,
                "priority": "high",
                "due_date": "2024-12-31T23:59:59Z",
                "category": "Work",
                "tags": ["development", "urgent"],
                "position": 0,
                "archived": False,
                "subtasks": [],
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            }
        }
