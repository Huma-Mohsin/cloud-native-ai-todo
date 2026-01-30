"""MCP tool handler for update_task operation.

Phase III: AI-Powered Chatbot - Natural Language Task Updates
"""

from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ...services.task_service import TaskService
from ...services.websocket_service import ws_manager
from ...events.task_events import TaskEventType
from ...schemas.task import UpdateTaskRequest
from ..schemas import UpdateTaskInput, UpdateTaskOutput

logger = logging.getLogger(__name__)


async def update_task_handler(input_data: UpdateTaskInput, session: AsyncSession) -> UpdateTaskOutput:
    """Handle update_task MCP tool request.

    Updates a task's title and/or description for the authenticated user.

    Args:
        input_data: UpdateTaskInput with user_id, task_id, and optional title/description
        session: Database session

    Returns:
        UpdateTaskOutput with success status, task_id, title, and message
    """
    try:
        # Get the task first to check if it exists
        task = await TaskService.get_task_by_id(
            task_id=input_data.task_id, session=session
        )

        if not task:
            return UpdateTaskOutput(
                success=False,
                task_id=input_data.task_id,
                title=None,
                message=f"Task not found (ID: {input_data.task_id})",
            )

        # Check authorization
        if task.user_id != input_data.user_id:
            return UpdateTaskOutput(
                success=False,
                task_id=input_data.task_id,
                title=None,
                message=f"Unauthorized: Task {input_data.task_id} does not belong to you",
            )

        # Check if at least one field is provided
        if all(field is None for field in [input_data.title, input_data.description, input_data.priority,
                                             input_data.due_date, input_data.category, input_data.tags]):
            return UpdateTaskOutput(
                success=False,
                task_id=input_data.task_id,
                title=task.title,
                message="No updates provided. Please specify what you'd like to update.",
            )

        # Parse due_date if provided
        from dateutil import parser as date_parser
        due_date_obj = None
        if input_data.due_date:
            try:
                due_date_obj = date_parser.isoparse(input_data.due_date)
            except Exception:
                logger.warning(f"Failed to parse due_date: {input_data.due_date}")

        # Update task
        update_data = UpdateTaskRequest(
            title=input_data.title,
            description=input_data.description,
            priority=input_data.priority,
            due_date=due_date_obj if input_data.due_date else None,
            category=input_data.category,
            tags=input_data.tags,
        )

        updated_task = await TaskService.update_task(
            task_id=input_data.task_id,
            user_id=input_data.user_id,
            task_data=update_data,
            session=session,
        )

        if not updated_task:
            return UpdateTaskOutput(
                success=False,
                task_id=input_data.task_id,
                title=task.title,
                message=f"Failed to update task (ID: {input_data.task_id})",
            )

        # Broadcast task_updated event via WebSocket
        try:
            await ws_manager.broadcast_task_event(
                user_id=input_data.user_id,
                event_type=TaskEventType.UPDATED,
                task_id=updated_task.id,
                task_data={
                    "id": updated_task.id,
                    "title": updated_task.title,
                    "description": updated_task.description,
                    "completed": updated_task.completed,
                    "priority": updated_task.priority,
                    "due_date": updated_task.due_date.isoformat() if updated_task.due_date else None,
                    "category": updated_task.category,
                    "tags": updated_task.tags,
                    "updated_at": updated_task.updated_at.isoformat() if updated_task.updated_at else None,
                },
            )
            logger.info(f"Broadcasted task_updated event for task {updated_task.id}")
        except Exception as e:
            logger.error(f"Failed to broadcast task_updated event: {e}")

        return UpdateTaskOutput(
            success=True,
            task_id=updated_task.id,
            title=updated_task.title,
            message=f"Task updated successfully: {updated_task.title} (ID: {updated_task.id})",
        )

    except Exception as e:
        return UpdateTaskOutput(
            success=False,
            task_id=input_data.task_id,
            title=None,
            message=f"Failed to update task: {str(e)}",
        )
