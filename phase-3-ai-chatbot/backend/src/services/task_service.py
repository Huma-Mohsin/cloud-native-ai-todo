"""Task service for business logic operations.

Phase III: Reused from Phase II for MCP tool integration.
"""

from datetime import datetime
from sqlalchemy import select, text, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.task import Task
from ..schemas.task import CreateTaskRequest, UpdateTaskRequest


class TaskService:
    """Service class for task operations."""

    @staticmethod
    async def _reset_sequence_if_empty(session: AsyncSession) -> None:
        """Reset task ID sequence to 1 if no tasks exist.

        This ensures that when all tasks are deleted, the next task
        starts with ID 1 instead of continuing from the last ID.
        """
        # Check if any tasks exist
        result = await session.execute(select(func.count()).select_from(Task))
        task_count = result.scalar()

        if task_count == 0:
            # No tasks exist - reset sequence to 1
            await session.execute(text("ALTER SEQUENCE tasks_id_seq RESTART WITH 1"))
            await session.commit()
            print("✅ Task sequence reset to 1 (no tasks exist)")

    @staticmethod
    async def create_task(
        user_id: str, task_data: CreateTaskRequest, session: AsyncSession
    ) -> Task:
        """Create a new task for a user.

        If no tasks exist, automatically resets the sequence to start from ID 1.
        """
        # Auto-reset sequence if no tasks exist
        await TaskService._reset_sequence_if_empty(session)

        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            completed=False,
            priority=task_data.priority or "medium",
            due_date=task_data.due_date,
            category=task_data.category,
            tags=task_data.tags or [],
            position=0,
            archived=False,
        )

        session.add(task)
        await session.commit()
        await session.refresh(task)

        return task

    @staticmethod
    async def get_user_tasks(
        user_id: str,
        session: AsyncSession,
        completed: bool | None = None,
        archived: bool = False,
    ) -> list[Task]:
        """Get all tasks for a user with optional filtering."""
        statement = select(Task).where(Task.user_id == user_id)
        statement = statement.where(Task.archived == archived)

        if completed is not None:
            statement = statement.where(Task.completed == completed)

        statement = statement.order_by(Task.completed.asc(), Task.created_at.desc())

        result = await session.execute(statement)
        tasks = result.scalars().all()

        return list(tasks)

    @staticmethod
    async def get_task_by_id(task_id: int, session: AsyncSession) -> Task | None:
        """Get a task by its ID."""
        statement = select(Task).where(Task.id == task_id)
        result = await session.execute(statement)
        task = result.scalar_one_or_none()

        return task

    @staticmethod
    async def update_task(
        task_id: int, user_id: str, task_data: UpdateTaskRequest, session: AsyncSession
    ) -> Task | None:
        """Update a task's fields."""
        task = await TaskService.get_task_by_id(task_id, session)

        if not task or task.user_id != user_id:
            return None

        if task_data.title is not None:
            task.title = task_data.title

        if task_data.description is not None:
            task.description = task_data.description

        if task_data.completed is not None:
            task.completed = task_data.completed

        if task_data.priority is not None:
            task.priority = task_data.priority

        if task_data.due_date is not None:
            task.due_date = task_data.due_date

        if task_data.category is not None:
            task.category = task_data.category

        if task_data.tags is not None:
            task.tags = task_data.tags

        if task_data.position is not None:
            task.position = task_data.position

        if task_data.archived is not None:
            task.archived = task_data.archived

        # Update reminder fields
        if task_data.reminder_time is not None:
            task.reminder_time = task_data.reminder_time

        if task_data.reminder_enabled is not None:
            task.reminder_enabled = task_data.reminder_enabled

        if task_data.snooze_until is not None:
            task.snooze_until = task_data.snooze_until

        if task_data.snooze_count is not None:
            task.snooze_count = task_data.snooze_count

        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return task

    @staticmethod
    async def delete_task(task_id: int, user_id: str, session: AsyncSession) -> bool:
        """Delete a task.

        If this was the last task, automatically resets the sequence to 1.
        """
        task = await TaskService.get_task_by_id(task_id, session)

        if not task or task.user_id != user_id:
            return False

        await session.delete(task)
        await session.commit()

        # Auto-reset sequence if no tasks left
        await TaskService._reset_sequence_if_empty(session)

        return True
