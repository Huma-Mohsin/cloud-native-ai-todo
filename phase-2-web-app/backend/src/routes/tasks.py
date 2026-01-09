"""Task API routes.

This module defines REST API endpoints for task CRUD operations.
All endpoints require authentication via JWT token.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..middleware.auth import get_current_user_id
from ..schemas.task import CreateTaskRequest, UpdateTaskRequest, TaskResponse
from ..services.task_service import TaskService


# Create router with /tasks prefix
router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task"
)
async def create_task(
    task_data: CreateTaskRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Create a new task for the authenticated user.

    Args:
        task_data: Task creation data (title, description)
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        Created task with all fields

    Raises:
        401: If authentication fails
        422: If validation fails
    """
    task = await TaskService.create_task(user_id, task_data, session)
    return task


@router.get(
    "",
    response_model=List[TaskResponse],
    summary="Get all tasks for current user"
)
async def get_tasks(
    completed: Optional[bool] = Query(
        None,
        description="Filter by completion status (true/false/null for all)"
    ),
    archived: bool = Query(False, description="Show archived tasks"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title/description"),
    sort_by: str = Query("created_at", description="Sort by: created_at, due_date, priority, position"),
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get all tasks for the authenticated user with filters and sorting.

    Args:
        completed: Optional filter for completion status
        archived: Show archived tasks
        category: Filter by category
        search: Search query
        sort_by: Sorting field
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        List of tasks (may be empty)

    Raises:
        401: If authentication fails
    """
    tasks = await TaskService.get_user_tasks(
        user_id, session, completed, archived, category, search, sort_by
    )
    return tasks


@router.get(
    "/stats",
    summary="Get task statistics"
)
async def get_task_stats(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get task statistics for the authenticated user.

    Args:
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        Task statistics (total, completed, pending, completion_rate)

    Raises:
        401: If authentication fails
    """
    stats = await TaskService.get_task_stats(user_id, session)
    return stats


# Smart Filter Endpoints (must be before /{task_id} to avoid route conflicts)

@router.get(
    "/today",
    response_model=List[TaskResponse],
    summary="Get tasks due today"
)
async def get_today_tasks(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get all tasks due today for the authenticated user."""
    tasks = await TaskService.get_today_tasks(user_id, session)
    return tasks


@router.get(
    "/overdue",
    response_model=List[TaskResponse],
    summary="Get overdue tasks"
)
async def get_overdue_tasks(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get all overdue tasks for the authenticated user."""
    tasks = await TaskService.get_overdue_tasks(user_id, session)
    return tasks


@router.get(
    "/upcoming",
    response_model=List[TaskResponse],
    summary="Get upcoming tasks"
)
async def get_upcoming_tasks(
    days: int = Query(7, description="Number of days ahead"),
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get tasks due in the next N days."""
    tasks = await TaskService.get_upcoming_tasks(user_id, days, session)
    return tasks


@router.get(
    "/categories",
    response_model=List[str],
    summary="Get all categories"
)
async def get_categories(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get all unique categories used by the user."""
    categories = await TaskService.get_categories(user_id, session)
    return categories


# Export Endpoint (must also be before /{task_id})

@router.get(
    "/export",
    summary="Export tasks as JSON or CSV"
)
async def export_tasks(
    format: str = Query("json", description="Export format: json or csv"),
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Export all tasks in JSON or CSV format."""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    import json

    tasks = await TaskService.get_user_tasks(user_id, session)

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            "ID", "Title", "Description", "Completed", "Priority",
            "Due Date", "Category", "Tags", "Created At", "Updated At"
        ])

        # Write data
        for task in tasks:
            writer.writerow([
                task.id,
                task.title,
                task.description or "",
                task.completed,
                task.priority,
                task.due_date.isoformat() if task.due_date else "",
                task.category or "",
                ",".join(task.tags),
                task.created_at.isoformat(),
                task.updated_at.isoformat()
            ])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=tasks.csv"}
        )

    else:  # JSON format
        tasks_data = [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "priority": task.priority,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "category": task.category,
                "tags": task.tags,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat(),
            }
            for task in tasks
        ]

        return StreamingResponse(
            iter([json.dumps(tasks_data, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=tasks.json"}
        )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get a task by ID"
)
async def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get a specific task by ID.

    Args:
        task_id: ID of the task to retrieve
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        Task object

    Raises:
        401: If authentication fails
        404: If task not found or doesn't belong to the user
    """
    task = await TaskService.get_task_by_id(task_id, session)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Verify ownership
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own tasks"
        )

    return task


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task"
)
async def update_task(
    task_id: int,
    task_data: UpdateTaskRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Update a task's fields (partial update supported).

    Args:
        task_id: ID of the task to update
        task_data: Updated task data (only provide fields to update)
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        Updated task object

    Raises:
        401: If authentication fails
        404: If task not found or doesn't belong to the user
        422: If validation fails
    """
    task = await TaskService.update_task(task_id, user_id, task_data, session)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to update it"
        )

    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task"
)
async def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Delete a task.

    Args:
        task_id: ID of the task to delete
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        No content (204) on success

    Raises:
        401: If authentication fails
        404: If task not found or doesn't belong to the user
    """
    success = await TaskService.delete_task(task_id, user_id, session)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to delete it"
        )

    return None


# Bulk Operations

@router.post(
    "/bulk/positions",
    summary="Update positions of multiple tasks"
)
async def bulk_update_positions(
    positions: dict,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Update positions of multiple tasks (for drag & drop).

    Body should be a dict like: {"1": 0, "2": 1, "3": 2}
    """
    success = await TaskService.bulk_update_positions(user_id, positions, session)
    return {"success": success}
