"""MCP tool handler for list_tasks operation.

Phase III: AI-Powered Chatbot - Natural Language Task Listing
"""

from sqlalchemy.ext.asyncio import AsyncSession

from ...services.task_service import TaskService
from ..schemas import ListTasksInput, ListTasksOutput, TaskInfo


async def list_tasks_handler(input_data: ListTasksInput, session: AsyncSession) -> ListTasksOutput:
    """Handle list_tasks MCP tool request.

    Lists tasks for the authenticated user with optional status filter.

    Args:
        input_data: ListTasksInput with user_id and optional status filter
        session: Database session

    Returns:
        ListTasksOutput with success status, tasks list, count, and message
    """
    try:
        # Determine completed filter based on status
        completed_filter = None
        if input_data.status == "completed":
            completed_filter = True
        elif input_data.status == "pending":
            completed_filter = False

        # Get tasks from TaskService
        tasks = await TaskService.get_user_tasks(
            user_id=input_data.user_id,
            session=session,
            completed=completed_filter,
            archived=False,
        )

        # Convert to TaskInfo objects
        task_infos = [
            TaskInfo(
                id=task.id,
                title=task.title,
                description=task.description,
                completed=task.completed,
            )
            for task in tasks
        ]

        # Generate message
        count = len(task_infos)
        if input_data.status:
            message = f"Found {count} {input_data.status} task{'s' if count != 1 else ''}"
        else:
            message = f"Found {count} task{'s' if count != 1 else ''}"

        return ListTasksOutput(
            success=True,
            tasks=task_infos,
            count=count,
            message=message,
        )

    except Exception as e:
        return ListTasksOutput(
            success=False,
            tasks=[],
            count=0,
            message=f"Failed to list tasks: {str(e)}",
        )
