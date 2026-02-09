"""Integration tests for delete_task MCP tool.

Phase III: AI-Powered Chatbot - T043
Tests delete_task tool with real database operations.
"""

import pytest

from src.mcp.tools.delete_task import delete_task_handler
from src.mcp.schemas import DeleteTaskInput
from src.services.task_service import TaskService
from src.schemas.task import CreateTaskRequest, UpdateTaskRequest


@pytest.mark.asyncio
async def test_delete_task_success(async_session):
    """Test deleting a task successfully.

    Acceptance Criteria:
    - Task is removed from database
    - Success response is returned
    - Task title and ID are included
    """
    user_id = "test_user_1"

    # Create task
    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Delete me", description="To be deleted", priority="medium"
        ),
        session=async_session,
    )

    input_data = DeleteTaskInput(user_id=user_id, task_id=task.id)
    result = await delete_task_handler(input_data, async_session)

    assert result.success is True
    assert result.task_id == task.id
    assert result.title == "Delete me"
    assert "deleted" in result.message.lower()


@pytest.mark.asyncio
async def test_delete_task_removed_from_database(async_session):
    """Test that deleted task is removed from database.

    Acceptance Criteria:
    - Task no longer exists in database
    - Cannot be retrieved after deletion
    """
    user_id = "test_user_1"

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Test task", description=None, priority="medium"
        ),
        session=async_session,
    )
    task_id = task.id

    input_data = DeleteTaskInput(user_id=user_id, task_id=task_id)
    await delete_task_handler(input_data, async_session)

    # Verify deletion
    deleted_task = await TaskService.get_task_by_id(
        task_id=task_id, session=async_session
    )

    assert deleted_task is None


@pytest.mark.asyncio
async def test_delete_task_not_found(async_session):
    """Test deleting a non-existent task.

    Acceptance Criteria:
    - Returns failure response
    - Error message indicates task not found
    """
    user_id = "test_user_1"

    input_data = DeleteTaskInput(user_id=user_id, task_id=99999)
    result = await delete_task_handler(input_data, async_session)

    assert result.success is False
    assert "not found" in result.message.lower()


@pytest.mark.asyncio
async def test_delete_task_unauthorized(async_session):
    """Test deleting another user's task.

    Acceptance Criteria:
    - Returns failure response
    - Task remains in database for owner
    """
    user1 = "test_user_1"
    user2 = "test_user_2"

    # Create task for user1
    task = await TaskService.create_task(
        user_id=user1,
        task_data=CreateTaskRequest(
            title="User 1 task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Attempt to delete as user2
    input_data = DeleteTaskInput(user_id=user2, task_id=task.id)
    result = await delete_task_handler(input_data, async_session)

    assert result.success is False

    # Verify task still exists
    existing_task = await TaskService.get_task_by_id(
        task_id=task.id, session=async_session
    )
    assert existing_task is not None


@pytest.mark.asyncio
async def test_delete_completed_task(async_session):
    """Test deleting a completed task.

    Acceptance Criteria:
    - Completed tasks can be deleted
    - Deletion succeeds regardless of completion status
    """
    user_id = "test_user_1"

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Completed task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Complete task
    await TaskService.update_task(
        task_id=task.id,
        user_id=user_id,
        task_data=UpdateTaskRequest(completed=True),
        session=async_session,
    )

    # Delete task
    input_data = DeleteTaskInput(user_id=user_id, task_id=task.id)
    result = await delete_task_handler(input_data, async_session)

    assert result.success is True


@pytest.mark.asyncio
async def test_delete_multiple_tasks(async_session):
    """Test deleting multiple tasks.

    Acceptance Criteria:
    - Multiple tasks can be deleted independently
    - Each deletion is persisted
    """
    user_id = "test_user_1"

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

    # Delete both tasks
    result1 = await delete_task_handler(
        DeleteTaskInput(user_id=user_id, task_id=task1.id), async_session
    )
    result2 = await delete_task_handler(
        DeleteTaskInput(user_id=user_id, task_id=task2.id), async_session
    )

    assert result1.success is True
    assert result2.success is True

    # Verify both deleted
    deleted1 = await TaskService.get_task_by_id(
        task_id=task1.id, session=async_session
    )
    deleted2 = await TaskService.get_task_by_id(
        task_id=task2.id, session=async_session
    )

    assert deleted1 is None
    assert deleted2 is None


@pytest.mark.asyncio
async def test_delete_task_twice(async_session):
    """Test attempting to delete same task twice.

    Acceptance Criteria:
    - Second deletion returns failure
    - Error message indicates task not found
    """
    user_id = "test_user_1"

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Delete once", description=None, priority="medium"
        ),
        session=async_session,
    )

    input_data = DeleteTaskInput(user_id=user_id, task_id=task.id)

    # First deletion
    result1 = await delete_task_handler(input_data, async_session)
    assert result1.success is True

    # Second deletion
    result2 = await delete_task_handler(input_data, async_session)
    assert result2.success is False
    assert "not found" in result2.message.lower()


@pytest.mark.asyncio
async def test_delete_task_output_format(async_session):
    """Test that delete_task returns correctly formatted output.

    Acceptance Criteria:
    - Output matches DeleteTaskOutput schema
    - All required fields are present
    """
    user_id = "test_user_1"

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Format test", description=None, priority="medium"
        ),
        session=async_session,
    )

    input_data = DeleteTaskInput(user_id=user_id, task_id=task.id)
    result = await delete_task_handler(input_data, async_session)

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


@pytest.mark.asyncio
async def test_delete_task_doesnt_affect_other_tasks(async_session):
    """Test that deleting a task doesn't affect other tasks.

    Acceptance Criteria:
    - Other tasks remain unchanged
    - Only specified task is deleted
    """
    user_id = "test_user_1"

    # Create multiple tasks
    task1 = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Keep me", description=None, priority="medium"
        ),
        session=async_session,
    )
    task2 = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Delete me", description=None, priority="medium"
        ),
        session=async_session,
    )

    # Delete task2
    input_data = DeleteTaskInput(user_id=user_id, task_id=task2.id)
    await delete_task_handler(input_data, async_session)

    # Verify task1 still exists
    remaining_task = await TaskService.get_task_by_id(
        task_id=task1.id, session=async_session
    )

    assert remaining_task is not None
    assert remaining_task.title == "Keep me"
