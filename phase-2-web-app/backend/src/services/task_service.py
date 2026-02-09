"""Task service for business logic operations.

This module provides the TaskService class for managing task CRUD operations.
"""

from datetime import datetime, timedelta

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.task import Task
from ..schemas.task import CreateTaskRequest, UpdateTaskRequest


class TaskService:
    """Service class for task operations.

    This class encapsulates all task-related business logic and database
    operations, keeping route handlers clean and focused.
    """

    @staticmethod
    async def create_task(
        user_id: int, task_data: CreateTaskRequest, session: AsyncSession
    ) -> Task:
        """Create a new task for a user.

        Args:
            user_id: ID of the user creating the task
            task_data: Task creation data (title, description, priority, etc.)
            session: Database session

        Returns:
            Created Task object
        """
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
        user_id: int,
        session: AsyncSession,
        completed: bool | None = None,
        archived: bool = False,
        category: str | None = None,
        search: str | None = None,
        sort_by: str = "created_at",
    ) -> list[Task]:
        """Get all tasks for a user, with filtering and sorting options.

        Args:
            user_id: ID of the user
            session: Database session
            completed: Optional filter for completion status (True/False/None)
            archived: Show archived tasks (default: False)
            category: Filter by category
            search: Search in title and description
            sort_by: Sort field (created_at, due_date, priority, position)

        Returns:
            List of Task objects
        """
        statement = select(Task).where(Task.user_id == user_id)

        # Filter by archived status
        statement = statement.where(Task.archived == archived)

        if completed is not None:
            statement = statement.where(Task.completed == completed)

        if category:
            statement = statement.where(Task.category == category)

        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                (Task.title.ilike(search_term)) | (Task.description.ilike(search_term))
            )

        # Sorting
        if sort_by == "due_date":
            statement = statement.order_by(Task.due_date.desc().nullslast())
        elif sort_by == "priority":
            # Sort by priority: high > medium > low
            statement = statement.order_by(Task.priority.desc(), Task.created_at.desc())
        elif sort_by == "position":
            statement = statement.order_by(Task.position.asc())
        else:  # default: created_at
            statement = statement.order_by(Task.created_at.desc())

        result = await session.execute(statement)
        tasks = result.scalars().all()

        return list(tasks)

    @staticmethod
    async def get_task_by_id(task_id: int, session: AsyncSession) -> Task | None:
        """Get a task by its ID.

        Args:
            task_id: ID of the task
            session: Database session

        Returns:
            Task object if found, None otherwise
        """
        statement = select(Task).where(Task.id == task_id)
        result = await session.execute(statement)
        task = result.scalar_one_or_none()

        return task

    @staticmethod
    async def update_task(
        task_id: int, user_id: int, task_data: UpdateTaskRequest, session: AsyncSession
    ) -> Task | None:
        """Update a task's fields.

        Args:
            task_id: ID of the task to update
            user_id: ID of the user (for authorization)
            task_data: Updated task data (partial updates allowed)
            session: Database session

        Returns:
            Updated Task object if found and authorized, None otherwise
        """
        # Get the task
        task = await TaskService.get_task_by_id(task_id, session)

        if not task or task.user_id != user_id:
            return None

        # Update only provided fields
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

        # Update timestamp
        task.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(task)

        return task

    @staticmethod
    async def delete_task(task_id: int, user_id: int, session: AsyncSession) -> bool:
        """Delete a task.

        Args:
            task_id: ID of the task to delete
            user_id: ID of the user (for authorization)
            session: Database session

        Returns:
            True if task was deleted, False if not found or unauthorized
        """
        # Get the task
        task = await TaskService.get_task_by_id(task_id, session)

        if not task or task.user_id != user_id:
            return False

        await session.delete(task)
        await session.commit()

        return True

    @staticmethod
    async def get_task_stats(user_id: int, session: AsyncSession) -> dict:
        """Get task statistics for a user.

        Args:
            user_id: ID of the user
            session: Database session

        Returns:
            Dictionary with task statistics (total, completed, pending, by priority, etc.)
        """
        all_tasks = await TaskService.get_user_tasks(user_id, session)

        total = len(all_tasks)
        completed = sum(1 for task in all_tasks if task.completed)
        pending = total - completed

        # Priority breakdown
        high_priority = sum(
            1 for task in all_tasks if task.priority == "high" and not task.completed
        )
        medium_priority = sum(
            1 for task in all_tasks if task.priority == "medium" and not task.completed
        )
        low_priority = sum(
            1 for task in all_tasks if task.priority == "low" and not task.completed
        )

        # Overdue tasks
        now = datetime.utcnow()
        overdue = sum(
            1
            for task in all_tasks
            if task.due_date and task.due_date < now and not task.completed
        )

        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completion_rate": round((completed / total * 100) if total > 0 else 0, 1),
            "high_priority": high_priority,
            "medium_priority": medium_priority,
            "low_priority": low_priority,
            "overdue": overdue,
        }

    @staticmethod
    async def get_today_tasks(user_id: int, session: AsyncSession) -> list[Task]:
        """Get tasks due today.

        Args:
            user_id: ID of the user
            session: Database session

        Returns:
            List of tasks due today
        """
        today_start = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        today_end = today_start + timedelta(days=1)

        statement = (
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.archived == False)
            .where(Task.completed == False)
            .where(and_(Task.due_date >= today_start, Task.due_date < today_end))
            .order_by(Task.priority.desc(), Task.created_at.desc())
        )

        result = await session.execute(statement)
        return list(result.scalars().all())

    @staticmethod
    async def get_overdue_tasks(user_id: int, session: AsyncSession) -> list[Task]:
        """Get overdue tasks.

        Args:
            user_id: ID of the user
            session: Database session

        Returns:
            List of overdue tasks
        """
        now = datetime.utcnow()

        statement = (
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.archived == False)
            .where(Task.completed == False)
            .where(Task.due_date < now)
            .order_by(Task.due_date.asc())
        )

        result = await session.execute(statement)
        return list(result.scalars().all())

    @staticmethod
    async def get_upcoming_tasks(
        user_id: int, days: int, session: AsyncSession
    ) -> list[Task]:
        """Get tasks due in the next N days.

        Args:
            user_id: ID of the user
            days: Number of days ahead
            session: Database session

        Returns:
            List of upcoming tasks
        """
        now = datetime.utcnow()
        future = now + timedelta(days=days)

        statement = (
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.archived == False)
            .where(Task.completed == False)
            .where(and_(Task.due_date >= now, Task.due_date <= future))
            .order_by(Task.due_date.asc())
        )

        result = await session.execute(statement)
        return list(result.scalars().all())

    @staticmethod
    async def get_categories(user_id: int, session: AsyncSession) -> list[str]:
        """Get all unique categories used by user.

        Args:
            user_id: ID of the user
            session: Database session

        Returns:
            List of unique category names
        """
        statement = (
            select(Task.category)
            .where(Task.user_id == user_id)
            .where(Task.category.isnot(None))
            .distinct()
        )

        result = await session.execute(statement)
        categories = result.scalars().all()
        return list(categories)

    @staticmethod
    async def bulk_update_positions(
        user_id: int, task_positions: dict, session: AsyncSession
    ) -> bool:
        """Update positions of multiple tasks (for drag & drop).

        Args:
            user_id: ID of the user
            task_positions: Dict of task_id: position
            session: Database session

        Returns:
            True if successful
        """
        for task_id, position in task_positions.items():
            task = await TaskService.get_task_by_id(int(task_id), session)
            if task and task.user_id == user_id:
                task.position = position
                task.updated_at = datetime.utcnow()

        await session.commit()
        return True
