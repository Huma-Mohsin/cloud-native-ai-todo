"""MCP tool handler for complete_task operation.

Phase III: AI-Powered Chatbot - Natural Language Task Completion
"""

from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ...services.task_service import TaskService
from ...services.websocket_service import ws_manager
from ...events.task_events import TaskEventType
from ...schemas.task import UpdateTaskRequest
from ..schemas import CompleteTaskInput, CompleteTaskOutput

logger = logging.getLogger(__name__)


async def complete_task_handler(input_data: CompleteTaskInput, session: AsyncSession) -> CompleteTaskOutput:
    """Handle complete_task MCP tool request.

    Marks a task as completed for the authenticated user.

    Args:
        input_data: CompleteTaskInput with user_id and task_id
        session: Database session

    Returns:
        CompleteTaskOutput with success status, task_id, title, and message
    """
    try:
        # Get the task first to check if it exists and get its title
        task = await TaskService.get_task_by_id(
            task_id=input_data.task_id, session=session
        )

        if not task:
            return CompleteTaskOutput(
                success=False,
                task_id=input_data.task_id,
                title=None,
                message=f"Task not found (ID: {input_data.task_id})",
            )

        # Check authorization
        if task.user_id != input_data.user_id:
            return CompleteTaskOutput(
                success=False,
                task_id=input_data.task_id,
                title=None,
                message=f"Unauthorized: Task {input_data.task_id} does not belong to you",
            )

        # Update task to completed
        update_data = UpdateTaskRequest(completed=True)
        updated_task = await TaskService.update_task(
            task_id=input_data.task_id,
            user_id=input_data.user_id,
            task_data=update_data,
            session=session,
        )

        if not updated_task:
            return CompleteTaskOutput(
                success=False,
                task_id=input_data.task_id,
                title=task.title,
                message=f"Failed to complete task: {task.title} (ID: {input_data.task_id})",
            )

        # Broadcast task_completed event via WebSocket
        try:
            await ws_manager.broadcast_task_event(
                user_id=input_data.user_id,
                event_type=TaskEventType.COMPLETED,
                task_id=updated_task.id,
                task_data={
                    "id": updated_task.id,
                    "completed": updated_task.completed,
                    "title": updated_task.title,
                },
            )
            logger.info(f"Broadcasted task_completed event for task {updated_task.id}")
        except Exception as e:
            logger.error(f"Failed to broadcast task_completed event: {e}")

        return CompleteTaskOutput(
            success=True,
            task_id=updated_task.id,
            title=updated_task.title,
            message=f"Task completed: {updated_task.title} (ID: {updated_task.id})",
        )

    except Exception as e:
        return CompleteTaskOutput(
            success=False,
            task_id=input_data.task_id,
            title=None,
            message=f"Failed to complete task: {str(e)}",
        )
