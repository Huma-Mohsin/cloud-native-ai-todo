"""MCP tool handler for add_task operation.

Phase III: AI-Powered Chatbot - Natural Language Task Creation
"""

from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ...models.task import Task
from ...services.task_service import TaskService
from ...services.websocket_service import ws_manager
from ...events.task_events import TaskEventType
from ..schemas import AddTaskInput, AddTaskOutput

logger = logging.getLogger(__name__)


async def add_task_handler(input_data: AddTaskInput, session: AsyncSession) -> AddTaskOutput:
    """Handle add_task MCP tool request.

    Creates a new task for the authenticated user.

    Args:
        input_data: AddTaskInput with user_id, title, and optional description
        session: Database session

    Returns:
        AddTaskOutput with success status, task_id, title, and message
    """
    try:
        # Create task using TaskService
        from ...schemas.task import CreateTaskRequest
        from dateutil import parser as date_parser

        # Parse due_date if provided
        due_date_obj = None
        if input_data.due_date:
            try:
                due_date_obj = date_parser.isoparse(input_data.due_date)
            except Exception:
                logger.warning(f"Failed to parse due_date: {input_data.due_date}")

        task_data = CreateTaskRequest(
            title=input_data.title,
            description=input_data.description,
            priority=input_data.priority or "medium",  # Default to medium if not provided
            category=input_data.category,
            tags=input_data.tags or [],
            due_date=due_date_obj,
        )

        task = await TaskService.create_task(
            user_id=input_data.user_id, task_data=task_data, session=session
        )

        # Broadcast task_created event via WebSocket
        try:
            await ws_manager.broadcast_task_event(
                user_id=input_data.user_id,
                event_type=TaskEventType.CREATED,
                task_id=task.id,
                task_data={
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "category": task.category,
                    "tags": task.tags,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                },
            )
            logger.info(f"Broadcasted task_created event for task {task.id}")
        except Exception as e:
            logger.error(f"Failed to broadcast task_created event: {e}")

        return AddTaskOutput(
            success=True,
            task_id=task.id,
            title=task.title,
            message=f"Task created successfully: {task.title} (ID: {task.id})",
        )

    except Exception as e:
        return AddTaskOutput(
            success=False,
            task_id=None,
            title=None,
            message=f"Failed to create task: {str(e)}",
        )
