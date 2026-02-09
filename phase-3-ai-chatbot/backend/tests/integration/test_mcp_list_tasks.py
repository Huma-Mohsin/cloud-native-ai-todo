"""Integration tests for list_tasks MCP tool.

Phase III: AI-Powered Chatbot - T029
Tests list_tasks tool with real database operations.
"""

import pytest

from src.mcp.tools.list_tasks import list_tasks_handler
from src.mcp.schemas import ListTasksInput
from src.services.task_service import TaskService
from src.schemas.task import CreateTaskRequest, UpdateTaskRequest


@pytest.mark.asyncio
async def test_list_tasks_all(async_session):
    """Test listing all tasks.

    Acceptance Criteria:
    - All user tasks are returned
    - Completed and pending tasks are included
    """
    user_id = "test_user_1"

    # Create tasks
    await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Task 1", description="Desc 1", priority="medium"
        ),
        session=async_session,
    )
    await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Task 2", description="Desc 2", priority="high"
        ),
        session=async_session,
    )

    input_data = ListTasksInput(user_id=user_id, status="all")
    result = await list_tasks_handler(input_data, async_session)

    assert result.success is True
    assert len(result.tasks) == 2
    assert result.count == 2


@pytest.mark.asyncio
async def test_list_tasks_pending(async_session):
    """Test listing only pending tasks.

    Acceptance Criteria:
    - Only incomplete tasks are returned
    - Completed tasks are excluded
    """
    user_id = "test_user_1"

    # Create pending task
    pending = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Pending task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Create completed task
    completed = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Completed task", description=None, priority="medium"
        ),
        session=async_session,
    )
    await TaskService.update_task(
        task_id=completed.id,
        user_id=user_id,
        task_data=UpdateTaskRequest(completed=True),
        session=async_session,
    )

    input_data = ListTasksInput(user_id=user_id, status="pending")
    result = await list_tasks_handler(input_data, async_session)

    assert result.success is True
    assert len(result.tasks) == 1
    assert result.tasks[0].title == "Pending task"
    assert result.tasks[0].completed is False


@pytest.mark.asyncio
async def test_list_tasks_completed(async_session):
    """Test listing only completed tasks.

    Acceptance Criteria:
    - Only completed tasks are returned
    - Pending tasks are excluded
    """
    user_id = "test_user_1"

    # Create pending task
    await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Pending task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Create completed task
    completed = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Completed task", description=None, priority="medium"
        ),
        session=async_session,
    )
    await TaskService.update_task(
        task_id=completed.id,
        user_id=user_id,
        task_data=UpdateTaskRequest(completed=True),
        session=async_session,
    )

    input_data = ListTasksInput(user_id=user_id, status="completed")
    result = await list_tasks_handler(input_data, async_session)

    assert result.success is True
    assert len(result.tasks) == 1
    assert result.tasks[0].title == "Completed task"
    assert result.tasks[0].completed is True


@pytest.mark.asyncio
async def test_list_tasks_empty(async_session):
    """Test listing tasks when user has none.

    Acceptance Criteria:
    - Empty list is returned
    - Count is 0
    - Success is True
    """
    user_id = "test_user_1"

    input_data = ListTasksInput(user_id=user_id, status="all")
    result = await list_tasks_handler(input_data, async_session)

    assert result.success is True
    assert len(result.tasks) == 0
    assert result.count == 0


@pytest.mark.asyncio
async def test_list_tasks_user_isolation(async_session):
    """Test that users only see their own tasks.

    Acceptance Criteria:
    - Only user's tasks are returned
    - Other users' tasks are not included
    """
    user1 = "test_user_1"
    user2 = "test_user_2"

    # Create tasks for user1
    await TaskService.create_task(
        user_id=user1,
        task_data=CreateTaskRequest(
            title="User 1 task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Create tasks for user2
    await TaskService.create_task(
        user_id=user2,
        task_data=CreateTaskRequest(
            title="User 2 task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # List tasks for user1
    input_data = ListTasksInput(user_id=user1, status="all")
    result = await list_tasks_handler(input_data, async_session)

    assert result.success is True
    assert len(result.tasks) == 1
    assert result.tasks[0].title == "User 1 task"


@pytest.mark.asyncio
async def test_list_tasks_output_format(async_session):
    """Test that list_tasks returns correctly formatted output.

    Acceptance Criteria:
    - Each task has id, title, description, completed, created_at
    - Output matches ListTasksOutput schema
    """
    user_id = "test_user_1"

    await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Test task", description="Test description", priority="medium"
        ),
        session=async_session,
    )

    input_data = ListTasksInput(user_id=user_id, status="all")
    result = await list_tasks_handler(input_data, async_session)

    assert result.success is True
    assert len(result.tasks) == 1

    task = result.tasks[0]
    # TaskInfo is a Pydantic model with id, title, description, completed attributes
    assert hasattr(task, "id")
    assert hasattr(task, "title")
    assert hasattr(task, "description")
    assert hasattr(task, "completed")

    assert task.title == "Test task"
    assert task.description == "Test description"
    assert task.completed is False


@pytest.mark.asyncio
async def test_list_tasks_ordering(async_session):
    """Test that tasks are ordered by created_at descending.

    Acceptance Criteria:
    - Newest tasks appear first
    - Tasks are in reverse chronological order
    """
    user_id = "test_user_1"

    # Create tasks in sequence
    task1 = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="First task", description=None, priority="medium"
        ),
        session=async_session,
    )

    task2 = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Second task", description=None, priority="medium"
        ),
        session=async_session,
    )

    task3 = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Third task", description=None, priority="medium"
        ),
        session=async_session,
    )

    input_data = ListTasksInput(user_id=user_id, status="all")
    result = await list_tasks_handler(input_data, async_session)

    assert len(result.tasks) == 3
    # Newest first (TaskInfo objects have .id attribute)
    assert result.tasks[0].id == task3.id
    assert result.tasks[1].id == task2.id
    assert result.tasks[2].id == task1.id


@pytest.mark.asyncio
async def test_list_tasks_default_status(async_session):
    """Test that status defaults to 'all' if not specified.

    Acceptance Criteria:
    - Default status is 'all'
    - All tasks are returned when status is not specified
    """
    user_id = "test_user_1"

    await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Task 1", description=None, priority="medium"
        ),
        session=async_session,
    )

    input_data = ListTasksInput(user_id=user_id, status=None)
    result = await list_tasks_handler(input_data, async_session)

    assert result.success is True
    assert len(result.tasks) == 1
