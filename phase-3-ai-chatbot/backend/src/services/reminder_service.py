"""Reminder Service for Task Notifications.

This service handles task reminders, snoozing, and notification triggers.
"""

from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.task import Task


class ReminderService:
    """Service for managing task reminders."""

    @staticmethod
    async def set_reminder(
        task_id: int,
        user_id: str,
        reminder_time: datetime,
        session: AsyncSession
    ) -> Task | None:
        """Set a reminder for a task.

        Args:
            task_id: Task ID to set reminder for
            user_id: User ID (for authorization)
            reminder_time: When to trigger the reminder
            session: Database session

        Returns:
            Updated task or None if not found/unauthorized
        """
        # Get task
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(statement)
        task = result.scalar_one_or_none()

        if not task:
            return None

        # Set reminder
        task.reminder_time = reminder_time
        task.reminder_enabled = True
        task.snooze_until = None  # Clear any existing snooze
        task.snooze_count = 0  # Reset snooze count
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return task

    @staticmethod
    async def snooze_reminder(
        task_id: int,
        user_id: str,
        snooze_minutes: int,
        session: AsyncSession
    ) -> Task | None:
        """Snooze a task reminder.

        Args:
            task_id: Task ID to snooze
            user_id: User ID (for authorization)
            snooze_minutes: How many minutes to snooze
            session: Database session

        Returns:
            Updated task or None if not found/unauthorized
        """
        # Get task
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(statement)
        task = result.scalar_one_or_none()

        if not task:
            return None

        # Calculate snooze time
        snooze_until = datetime.utcnow() + timedelta(minutes=snooze_minutes)

        # Update task
        task.snooze_until = snooze_until
        task.snooze_count += 1
        task.last_reminded_at = datetime.utcnow()  # Mark when we last reminded
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return task

    @staticmethod
    async def dismiss_reminder(
        task_id: int,
        user_id: str,
        session: AsyncSession
    ) -> Task | None:
        """Dismiss a task reminder.

        Args:
            task_id: Task ID
            user_id: User ID (for authorization)
            session: Database session

        Returns:
            Updated task or None if not found/unauthorized
        """
        # Get task
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(statement)
        task = result.scalar_one_or_none()

        if not task:
            return None

        # Disable reminder
        task.reminder_enabled = False
        task.snooze_until = None
        task.last_reminded_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return task

    @staticmethod
    async def get_pending_reminders(session: AsyncSession) -> list[Task]:
        """Get all tasks with pending reminders.

        Returns tasks that:
        1. Have reminder_enabled = True
        2. reminder_time <= now (if not snoozed)
        3. OR snooze_until <= now (if snoozed)

        Args:
            session: Database session

        Returns:
            List of tasks with pending reminders
        """
        current_time = datetime.utcnow()

        # Query for tasks with pending reminders
        statement = select(Task).where(
            Task.reminder_enabled == True,
            Task.completed == False  # Don't remind for completed tasks
        )

        result = await session.execute(statement)
        all_reminder_tasks = result.scalars().all()

        # Filter tasks that need reminding
        pending_tasks = []
        for task in all_reminder_tasks:
            # Check if snoozed
            if task.snooze_until:
                # Remind if snooze time has passed
                if task.snooze_until <= current_time:
                    pending_tasks.append(task)
            elif task.reminder_time:
                # Not snoozed - check reminder time
                if task.reminder_time <= current_time:
                    # Also check if we haven't reminded recently (prevent spam)
                    if not task.last_reminded_at or (current_time - task.last_reminded_at).total_seconds() > 60:
                        pending_tasks.append(task)

        return pending_tasks

    @staticmethod
    async def get_user_reminders(user_id: str, session: AsyncSession) -> list[Task]:
        """Get all active reminders for a user.

        Args:
            user_id: User ID
            session: Database session

        Returns:
            List of tasks with active reminders
        """
        statement = select(Task).where(
            Task.user_id == user_id,
            Task.reminder_enabled == True,
            Task.completed == False
        ).order_by(Task.reminder_time.asc())

        result = await session.execute(statement)
        return list(result.scalars().all())

    @staticmethod
    async def cancel_reminder(
        task_id: int,
        user_id: str,
        session: AsyncSession
    ) -> Task | None:
        """Cancel a task reminder completely.

        Args:
            task_id: Task ID
            user_id: User ID (for authorization)
            session: Database session

        Returns:
            Updated task or None if not found/unauthorized
        """
        # Get task
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(statement)
        task = result.scalar_one_or_none()

        if not task:
            return None

        # Clear all reminder data
        task.reminder_enabled = False
        task.reminder_time = None
        task.snooze_until = None
        task.snooze_count = 0
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return task
