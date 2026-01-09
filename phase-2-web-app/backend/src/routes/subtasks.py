"""Subtask API routes.

This module defines REST API endpoints for subtask CRUD operations.
All endpoints require authentication via JWT token.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..middleware.auth import get_current_user_id
from ..schemas.subtask import CreateSubtaskRequest, UpdateSubtaskRequest, SubtaskResponse
from ..services.subtask_service import SubtaskService
from ..services.task_service import TaskService


# Create router with /tasks/{task_id}/subtasks prefix
router = APIRouter(
    tags=["Subtasks"]
)


@router.post(
    "/tasks/{task_id}/subtasks",
    response_model=SubtaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new subtask"
)
async def create_subtask(
    task_id: int,
    subtask_data: CreateSubtaskRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Create a new subtask for a task.

    Args:
        task_id: ID of the parent task
        subtask_data: Subtask creation data
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        Created subtask with all fields

    Raises:
        401: If authentication fails
        404: If task not found or doesn't belong to user
        422: If validation fails
    """
    # Verify task ownership
    task = await TaskService.get_task_by_id(task_id, session)
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    subtask = await SubtaskService.create_subtask(task_id, subtask_data, session)
    return subtask


@router.get(
    "/tasks/{task_id}/subtasks",
    response_model=List[SubtaskResponse],
    summary="Get all subtasks for a task"
)
async def get_subtasks(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Get all subtasks for a task.

    Args:
        task_id: ID of the parent task
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        List of subtasks (may be empty)

    Raises:
        401: If authentication fails
        404: If task not found or doesn't belong to user
    """
    # Verify task ownership
    task = await TaskService.get_task_by_id(task_id, session)
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    subtasks = await SubtaskService.get_task_subtasks(task_id, session)
    return subtasks


@router.patch(
    "/subtasks/{subtask_id}",
    response_model=SubtaskResponse,
    summary="Update a subtask"
)
async def update_subtask(
    subtask_id: int,
    subtask_data: UpdateSubtaskRequest,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Update a subtask's fields.

    Args:
        subtask_id: ID of the subtask to update
        subtask_data: Updated subtask data
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        Updated subtask object

    Raises:
        401: If authentication fails
        404: If subtask not found or parent task doesn't belong to user
        422: If validation fails
    """
    # Get subtask and verify ownership through parent task
    subtask = await SubtaskService.get_subtask_by_id(subtask_id, session)
    if not subtask:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )

    task = await TaskService.get_task_by_id(subtask.task_id, session)
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this subtask"
        )

    updated_subtask = await SubtaskService.update_subtask(subtask_id, subtask_data, session)
    return updated_subtask


@router.delete(
    "/subtasks/{subtask_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a subtask"
)
async def delete_subtask(
    subtask_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Delete a subtask.

    Args:
        subtask_id: ID of the subtask to delete
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        No content (204) on success

    Raises:
        401: If authentication fails
        404: If subtask not found or parent task doesn't belong to user
    """
    # Get subtask and verify ownership through parent task
    subtask = await SubtaskService.get_subtask_by_id(subtask_id, session)
    if not subtask:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )

    task = await TaskService.get_task_by_id(subtask.task_id, session)
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this subtask"
        )

    success = await SubtaskService.delete_subtask(subtask_id, session)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )

    return None
