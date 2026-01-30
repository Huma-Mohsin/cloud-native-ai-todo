"""MCP tool handler for delete_task operation.

Phase III: AI-Powered Chatbot - Natural Language Task Deletion
"""

from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ...services.task_service import TaskService
from ...services.websocket_service import ws_manager
from ...events.task_events import TaskEventType
from ..schemas import DeleteTaskInput, DeleteTaskOutput

logger = logging.getLogger(__name__)


async def delete_task_handler(input_data: DeleteTaskInput, session: AsyncSession) -> DeleteTaskOutput:
    """Handle delete_task MCP tool request.

    Deletes a task for the authenticated user.

    Args:
        input_data: DeleteTaskInput with user_id and task_id
        session: Database session

    Returns:
        DeleteTaskOutput with success status, task_id, and message
    """
    try:
        # Get the task first to check if it exists
        task = await TaskService.get_task_by_id(
            task_id=input_data.task_id, session=session
        )

        if not task:
            return DeleteTaskOutput(
                success=False,
                task_id=input_data.task_id,
                message=f"Task not found (ID: {input_data.task_id})",
            )

        # Check authorization
        if task.user_id != input_data.user_id:
            return DeleteTaskOutput(
                success=False,
                task_id=input_data.task_id,
                message=f"Unauthorized: Task {input_data.task_id} does not belong to you",
            )

        # Delete the task
        deleted = await TaskService.delete_task(
            task_id=input_data.task_id,
            user_id=input_data.user_id,
            session=session,
        )

        if not deleted:
            return DeleteTaskOutput(
                success=False,
                task_id=input_data.task_id,
                message=f"Failed to delete task (ID: {input_data.task_id})",
            )

        # Broadcast task_deleted event via WebSocket
        try:
            await ws_manager.broadcast_task_event(
                user_id=input_data.user_id,
                event_type=TaskEventType.DELETED,
                task_id=input_data.task_id,
                task_data=None,
            )
            logger.info(f"Broadcasted task_deleted event for task {input_data.task_id}")
        except Exception as e:
            logger.error(f"Failed to broadcast task_deleted event: {e}")

        return DeleteTaskOutput(
            success=True,
            task_id=input_data.task_id,
            message=f"Task deleted successfully (ID: {input_data.task_id})",
        )

    except Exception as e:
        return DeleteTaskOutput(
            success=False,
            task_id=input_data.task_id,
            message=f"Failed to delete task: {str(e)}",
        )
