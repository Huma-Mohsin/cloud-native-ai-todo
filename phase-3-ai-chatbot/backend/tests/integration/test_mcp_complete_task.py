"""Integration tests for complete_task MCP tool.

Phase III: AI-Powered Chatbot - T036
Tests complete_task tool with real database operations.
"""

import pytest

from src.mcp.tools.complete_task import complete_task_handler
from src.mcp.schemas import CompleteTaskInput
from src.services.task_service import TaskService
from src.schemas.task import CreateTaskRequest


@pytest.mark.asyncio
async def test_complete_task_success(async_session):
    """Test completing a task successfully.

    Acceptance Criteria:
    - Task is marked as completed in database
    - Success response is returned
    - Task title and ID are included
    """
    user_id = 1

    # Create task
    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Buy groceries", description="Milk, eggs", priority="medium"
        ),
        session=async_session,
    )

    input_data = CompleteTaskInput(user_id=user_id, task_id=task.id)
    result = await complete_task_handler(input_data, async_session)

    assert result.success is True
    assert result.task_id == task.id
    assert result.title == "Buy groceries"
    assert "completed" in result.message.lower()


@pytest.mark.asyncio
async def test_complete_task_persists_to_database(async_session):
    """Test that completed status persists to database.

    Acceptance Criteria:
    - Task.completed is set to True
    - Change is persisted to database
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Test task", description=None, priority="medium"
        ),
        session=async_session,
    )

    input_data = CompleteTaskInput(user_id=user_id, task_id=task.id)
    await complete_task_handler(input_data, async_session)

    # Verify completion persists
    updated_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )

    assert updated_task.completed is True


@pytest.mark.asyncio
async def test_complete_task_not_found(async_session):
    """Test completing a non-existent task.

    Acceptance Criteria:
    - Returns failure response
    - Error message indicates task not found
    """
    user_id = 1

    input_data = CompleteTaskInput(user_id=user_id, task_id=99999)
    result = await complete_task_handler(input_data, async_session)

    assert result.success is False
    assert "not found" in result.message.lower()


@pytest.mark.asyncio
async def test_complete_task_unauthorized(async_session):
    """Test completing another user's task.

    Acceptance Criteria:
    - Returns failure response
    - Task remains unchanged
    """
    user1 = 1
    user2 = 2

    # Create task for user1
    task = await TaskService.create_task(
        user_id=user1,
        task_data=CreateTaskRequest(
            title="User 1 task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Attempt to complete as user2
    input_data = CompleteTaskInput(user_id=user2, task_id=task.id)
    result = await complete_task_handler(input_data, async_session)

    assert result.success is False

    # Verify task unchanged
    unchanged_task = await TaskService.get_task(
        task_id=task.id, user_id=user1, session=async_session
    )
    assert unchanged_task.completed is False


@pytest.mark.asyncio
async def test_complete_already_completed_task(async_session):
    """Test completing an already completed task.

    Acceptance Criteria:
    - Operation succeeds
    - Task remains completed
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Already done", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Complete task first time
    input_data = CompleteTaskInput(user_id=user_id, task_id=task.id)
    await complete_task_handler(input_data, async_session)

    # Complete again
    result2 = await complete_task_handler(input_data, async_session)

    assert result2.success is True

    # Verify still completed
    final_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )
    assert final_task.completed is True


@pytest.mark.asyncio
async def test_complete_multiple_tasks(async_session):
    """Test completing multiple tasks.

    Acceptance Criteria:
    - Multiple tasks can be completed independently
    - Each completion is persisted
    """
    user_id = 1

    # Create tasks
    task1 = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Task 1", description=None, priority="medium"
        ),
        session=async_session,
    )
    task2 = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Task 2", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Complete both tasks
    result1 = await complete_task_handler(
        CompleteTaskInput(user_id=user_id, task_id=task1.id), async_session
    )
    result2 = await complete_task_handler(
        CompleteTaskInput(user_id=user_id, task_id=task2.id), async_session
    )

    assert result1.success is True
    assert result2.success is True

    # Verify both completed
    updated1 = await TaskService.get_task(
        task_id=task1.id, user_id=user_id, session=async_session
    )
    updated2 = await TaskService.get_task(
        task_id=task2.id, user_id=user_id, session=async_session
    )

    assert updated1.completed is True
    assert updated2.completed is True


@pytest.mark.asyncio
async def test_complete_task_output_format(async_session):
    """Test that complete_task returns correctly formatted output.

    Acceptance Criteria:
    - Output matches CompleteTaskOutput schema
    - All required fields are present
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Format test", description=None, priority="medium"
        ),
        session=async_session,
    )

    input_data = CompleteTaskInput(user_id=user_id, task_id=task.id)
    result = await complete_task_handler(input_data, async_session)

    # Verify output structure
    assert hasattr(result, "success")
    assert hasattr(result, "task_id")
    assert hasattr(result, "title")
    assert hasattr(result, "message")

    # Verify output values
    assert isinstance(result.success, bool)
    assert isinstance(result.task_id, int)
    assert isinstance(result.title, str)
    assert isinstance(result.message, str)
