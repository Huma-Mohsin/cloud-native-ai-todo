"""Subtask service for business logic operations.

This module provides the SubtaskService class for managing subtask CRUD operations.
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.subtask import Subtask
from ..schemas.subtask import CreateSubtaskRequest, UpdateSubtaskRequest


class SubtaskService:
    """Service class for subtask operations."""

    @staticmethod
    async def create_subtask(
        task_id: int,
        subtask_data: CreateSubtaskRequest,
        session: AsyncSession
    ) -> Subtask:
        """Create a new subtask for a task.

        Args:
            task_id: ID of the parent task
            subtask_data: Subtask creation data
            session: Database session

        Returns:
            Created Subtask object
        """
        subtask = Subtask(
            task_id=task_id,
            title=subtask_data.title,
            completed=False,
            position=0,
        )

        session.add(subtask)
        await session.commit()
        await session.refresh(subtask)

        return subtask

    @staticmethod
    async def get_task_subtasks(
        task_id: int,
        session: AsyncSession
    ) -> List[Subtask]:
        """Get all subtasks for a task.

        Args:
            task_id: ID of the parent task
            session: Database session

        Returns:
            List of Subtask objects
        """
        statement = (
            select(Subtask)
            .where(Subtask.task_id == task_id)
            .order_by(Subtask.position.asc(), Subtask.created_at.asc())
        )

        result = await session.execute(statement)
        subtasks = result.scalars().all()

        return list(subtasks)

    @staticmethod
    async def get_subtask_by_id(
        subtask_id: int,
        session: AsyncSession
    ) -> Optional[Subtask]:
        """Get a subtask by its ID.

        Args:
            subtask_id: ID of the subtask
            session: Database session

        Returns:
            Subtask object if found, None otherwise
        """
        statement = select(Subtask).where(Subtask.id == subtask_id)
        result = await session.execute(statement)
        subtask = result.scalar_one_or_none()

        return subtask

    @staticmethod
    async def update_subtask(
        subtask_id: int,
        subtask_data: UpdateSubtaskRequest,
        session: AsyncSession
    ) -> Optional[Subtask]:
        """Update a subtask's fields.

        Args:
            subtask_id: ID of the subtask to update
            subtask_data: Updated subtask data
            session: Database session

        Returns:
            Updated Subtask object if found, None otherwise
        """
        subtask = await SubtaskService.get_subtask_by_id(subtask_id, session)

        if not subtask:
            return None

        # Update only provided fields
        if subtask_data.title is not None:
            subtask.title = subtask_data.title

        if subtask_data.completed is not None:
            subtask.completed = subtask_data.completed

        if subtask_data.position is not None:
            subtask.position = subtask_data.position

        # Update timestamp
        subtask.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(subtask)

        return subtask

    @staticmethod
    async def delete_subtask(
        subtask_id: int,
        session: AsyncSession
    ) -> bool:
        """Delete a subtask.

        Args:
            subtask_id: ID of the subtask to delete
            session: Database session

        Returns:
            True if subtask was deleted, False if not found
        """
        subtask = await SubtaskService.get_subtask_by_id(subtask_id, session)

        if not subtask:
            return False

        await session.delete(subtask)
        await session.commit()

        return True
