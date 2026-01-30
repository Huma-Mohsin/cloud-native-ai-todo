"""Reminder API routes for Phase III AI-Powered Chatbot.

This module provides REST endpoints for reminder management and polling.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from ...database import get_session
from ...services.reminder_service import ReminderService
from ...auth.better_auth import get_current_user, verify_user_access
from ...utils.logger import log_error, log_info

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


class ReminderResponse(BaseModel):
    """Response schema for reminder data."""

    task_id: int
    task_title: str
    reminder_time: str
    is_snoozed: bool
    snooze_count: int


@router.get("/{user_id}/pending", response_model=list[ReminderResponse])
async def get_pending_reminders(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> list[ReminderResponse]:
    """Get all pending reminders for the current user.

    This endpoint is polled by the frontend to check for reminders
    that should trigger notifications.

    Args:
        user_id: User identifier from Better Auth
        session: Database session (injected)
        current_user: Authenticated user from JWT token (injected)

    Returns:
        List of pending reminders

    Raises:
        HTTPException: If authentication fails
    """
    # Verify user has access to this resource
    verify_user_access(current_user["id"], user_id)

    log_info(
        f"Fetching pending reminders for user {user_id}",
        context={"user_id": user_id}
    )

    try:
        # Get all pending reminders from database
        pending_tasks = await ReminderService.get_pending_reminders(session)

        # Filter for this user only
        user_reminders = [task for task in pending_tasks if task.user_id == user_id]

        # Format response
        reminders = []
        for task in user_reminders:
            reminder_time = task.snooze_until if task.snooze_until else task.reminder_time
            if reminder_time:
                reminders.append(ReminderResponse(
                    task_id=task.id,
                    task_title=task.title,
                    reminder_time=reminder_time.isoformat(),
                    is_snoozed=task.snooze_until is not None,
                    snooze_count=task.snooze_count
                ))

        log_info(
            f"Found {len(reminders)} pending reminders",
            context={"user_id": user_id, "count": len(reminders)}
        )

        return reminders

    except Exception as e:
        log_error(
            e,
            context={"user_id": user_id, "endpoint": "get_pending_reminders"}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reminders: {str(e)}",
        )


@router.post("/{user_id}/acknowledge/{task_id}")
async def acknowledge_reminder(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Acknowledge that a reminder was shown to the user.

    This updates last_reminded_at to prevent showing the same reminder
    multiple times in quick succession.

    Args:
        user_id: User identifier
        task_id: Task ID
        session: Database session
        current_user: Authenticated user

    Returns:
        Success status
    """
    verify_user_access(current_user["id"], user_id)

    try:
        from datetime import datetime
        from ...services.task_service import TaskService

        task = await TaskService.get_task_by_id(task_id, session)

        if not task or task.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Update last_reminded_at
        task.last_reminded_at = datetime.utcnow()
        await session.commit()

        return {"success": True, "message": "Reminder acknowledged"}

    except HTTPException:
        raise
    except Exception as e:
        log_error(e, context={"user_id": user_id, "task_id": task_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to acknowledge reminder: {str(e)}"
        )


@router.post("/{user_id}/dismiss/{task_id}")
async def dismiss_reminder(
    user_id: str,
    task_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Dismiss a reminder completely (disable it).

    This disables the reminder by setting reminder_enabled = False,
    preventing it from triggering again.

    Args:
        user_id: User identifier
        task_id: Task ID
        session: Database session
        current_user: Authenticated user

    Returns:
        Success status

    Raises:
        HTTPException: If task not found or authentication fails
    """
    verify_user_access(current_user["id"], user_id)

    log_info(
        f"Dismissing reminder for task {task_id}",
        context={"user_id": user_id, "task_id": task_id}
    )

    try:
        task = await ReminderService.dismiss_reminder(task_id, user_id, session)

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        log_info(
            f"Reminder dismissed for task {task_id}",
            context={"user_id": user_id, "task_id": task_id}
        )

        return {
            "success": True,
            "message": "Reminder dismissed",
            "task_id": task_id
        }

    except HTTPException:
        raise
    except Exception as e:
        log_error(e, context={"user_id": user_id, "task_id": task_id})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to dismiss reminder: {str(e)}"
        )
