"""MCP tool schemas for Phase III AI-Powered Chatbot.

This module defines Pydantic schemas for MCP (Model Context Protocol) tool
inputs and outputs.
"""

from pydantic import BaseModel, Field


class AddTaskInput(BaseModel):
    """Input schema for add_task MCP tool.

    Attributes:
        user_id: User identifier from Better Auth
        title: Task title (required, 1-200 characters)
        description: Optional task description (max 1000 characters)
        priority: Optional priority (high/medium/low)
        due_date: Optional due date (ISO 8601 format string)
        category: Optional category name
        tags: Optional list of tags
    """

    user_id: str = Field(..., description="User identifier from authentication")
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: str | None = Field(None, max_length=1000, description="Optional task description")
    priority: str | None = Field(None, description="Optional priority: high, medium, or low")
    due_date: str | None = Field(None, description="Optional due date (ISO 8601 format)")
    category: str | None = Field(None, max_length=50, description="Optional category name")
    tags: list[str] | None = Field(None, description="Optional list of tags")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "auth0|123456789",
                "title": "Buy groceries",
                "description": "milk, eggs, bread",
                "priority": "high",
                "due_date": "2024-01-20T10:00:00Z",
                "category": "Shopping",
                "tags": ["urgent", "home"]
            }
        }


class AddTaskOutput(BaseModel):
    """Output schema for add_task MCP tool.

    Attributes:
        success: Whether the task was created successfully
        task_id: ID of the created task (if successful)
        title: Title of the created task (if successful)
        message: Human-readable confirmation message
    """

    success: bool = Field(..., description="Whether the operation succeeded")
    task_id: int | None = Field(None, description="ID of the created task")
    title: str | None = Field(None, description="Title of the created task")
    message: str = Field(..., description="Human-readable message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "task_id": 42,
                "title": "Buy groceries",
                "message": "Task created successfully: Buy groceries (ID: 42)"
            }
        }


class ListTasksInput(BaseModel):
    """Input schema for list_tasks MCP tool.

    Attributes:
        user_id: User identifier from Better Auth
        status: Optional filter for task status ('completed', 'pending', or None for all)
    """

    user_id: str = Field(..., description="User identifier from authentication")
    status: str | None = Field(None, description="Filter by status: 'completed', 'pending', or None for all")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "auth0|123456789",
                "status": "pending"
            }
        }


class TaskInfo(BaseModel):
    """Task information for list output.

    Attributes:
        id: Task ID
        title: Task title
        description: Task description (if any)
        completed: Whether the task is completed
    """

    id: int
    title: str
    description: str | None
    completed: bool


class ListTasksOutput(BaseModel):
    """Output schema for list_tasks MCP tool.

    Attributes:
        success: Whether the operation succeeded
        tasks: List of tasks
        count: Number of tasks returned
        message: Human-readable message
    """

    success: bool = Field(..., description="Whether the operation succeeded")
    tasks: list[TaskInfo] = Field(default_factory=list, description="List of tasks")
    count: int = Field(..., description="Number of tasks returned")
    message: str = Field(..., description="Human-readable message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "tasks": [
                    {"id": 1, "title": "Buy groceries", "description": "milk, eggs", "completed": False},
                    {"id": 2, "title": "Call mom", "description": None, "completed": False}
                ],
                "count": 2,
                "message": "Found 2 pending tasks"
            }
        }


class CompleteTaskInput(BaseModel):
    """Input schema for complete_task MCP tool.

    Attributes:
        user_id: User identifier from Better Auth
        task_id: ID of the task to complete
    """

    user_id: str = Field(..., description="User identifier from authentication")
    task_id: int = Field(..., description="ID of the task to complete")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "auth0|123456789",
                "task_id": 42
            }
        }


class CompleteTaskOutput(BaseModel):
    """Output schema for complete_task MCP tool.

    Attributes:
        success: Whether the task was completed successfully
        task_id: ID of the completed task
        title: Title of the completed task (if successful)
        message: Human-readable confirmation message
    """

    success: bool = Field(..., description="Whether the operation succeeded")
    task_id: int = Field(..., description="ID of the task")
    title: str | None = Field(None, description="Title of the task")
    message: str = Field(..., description="Human-readable message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "task_id": 42,
                "title": "Buy groceries",
                "message": "Task completed: Buy groceries (ID: 42)"
            }
        }


class DeleteTaskInput(BaseModel):
    """Input schema for delete_task MCP tool.

    Attributes:
        user_id: User identifier from Better Auth
        task_id: ID of the task to delete
    """

    user_id: str = Field(..., description="User identifier from authentication")
    task_id: int = Field(..., description="ID of the task to delete")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "auth0|123456789",
                "task_id": 42
            }
        }


class DeleteTaskOutput(BaseModel):
    """Output schema for delete_task MCP tool.

    Attributes:
        success: Whether the task was deleted successfully
        task_id: ID of the deleted task
        message: Human-readable confirmation message
    """

    success: bool = Field(..., description="Whether the operation succeeded")
    task_id: int = Field(..., description="ID of the task")
    message: str = Field(..., description="Human-readable message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "task_id": 42,
                "message": "Task deleted successfully (ID: 42)"
            }
        }


class UpdateTaskInput(BaseModel):
    """Input schema for update_task MCP tool.

    Attributes:
        user_id: User identifier from Better Auth
        task_id: ID of the task to update
        title: New task title (optional)
        description: New task description (optional)
        priority: New priority (optional): high, medium, or low
        due_date: New due date (optional, ISO 8601 format string)
        category: New category (optional)
        tags: New tags list (optional)
    """

    user_id: str = Field(..., description="User identifier from authentication")
    task_id: int = Field(..., description="ID of the task to update")
    title: str | None = Field(None, min_length=1, max_length=200, description="New task title")
    description: str | None = Field(None, max_length=1000, description="New task description")
    priority: str | None = Field(None, description="New priority: high, medium, or low")
    due_date: str | None = Field(None, description="New due date (ISO 8601 format)")
    category: str | None = Field(None, max_length=50, description="New category name")
    tags: list[str] | None = Field(None, description="New list of tags")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "auth0|123456789",
                "task_id": 42,
                "title": "Buy groceries and cook dinner",
                "description": "milk, eggs, bread, chicken",
                "priority": "high",
                "due_date": "2024-01-20T18:00:00Z",
                "category": "Home",
                "tags": ["urgent", "shopping"]
            }
        }


class UpdateTaskOutput(BaseModel):
    """Output schema for update_task MCP tool.

    Attributes:
        success: Whether the task was updated successfully
        task_id: ID of the updated task
        title: New title of the task (if successful)
        message: Human-readable confirmation message
    """

    success: bool = Field(..., description="Whether the operation succeeded")
    task_id: int = Field(..., description="ID of the task")
    title: str | None = Field(None, description="Updated title of the task")
    message: str = Field(..., description="Human-readable message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "task_id": 42,
                "title": "Buy groceries and cook dinner",
                "message": "Task updated successfully: Buy groceries and cook dinner (ID: 42)"
            }
        }
