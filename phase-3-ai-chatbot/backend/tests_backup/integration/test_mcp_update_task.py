"""Integration tests for update_task MCP tool.

Phase III: AI-Powered Chatbot - T050
Tests update_task tool with real database operations.
"""

import pytest

from src.mcp.tools.update_task import update_task_handler
from src.mcp.schemas import UpdateTaskInput
from src.services.task_service import TaskService
from src.schemas.task import CreateTaskRequest


@pytest.mark.asyncio
async def test_update_task_title(async_session):
    """Test updating task title.

    Acceptance Criteria:
    - Task title is updated in database
    - Success response is returned
    - New title is included in response
    """
    user_id = 1

    # Create task
    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Old title", description="Original description", priority="medium"
        ),
        session=async_session,
    )

    input_data = UpdateTaskInput(
        user_id=user_id, task_id=task.id, title="New title", description=None
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is True
    assert result.task_id == task.id
    assert result.title == "New title"
    assert "updated" in result.message.lower()


@pytest.mark.asyncio
async def test_update_task_description(async_session):
    """Test updating task description.

    Acceptance Criteria:
    - Task description is updated in database
    - Title remains unchanged
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Task title", description="Old description", priority="medium"
        ),
        session=async_session,
    )

    input_data = UpdateTaskInput(
        user_id=user_id,
        task_id=task.id,
        title=None,
        description="New description",
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is True

    # Verify changes persisted
    updated_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )

    assert updated_task.title == "Task title"  # Unchanged
    assert updated_task.description == "New description"  # Updated


@pytest.mark.asyncio
async def test_update_task_both_fields(async_session):
    """Test updating both title and description.

    Acceptance Criteria:
    - Both fields are updated
    - Changes persist to database
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Old title", description="Old description", priority="medium"
        ),
        session=async_session,
    )

    input_data = UpdateTaskInput(
        user_id=user_id,
        task_id=task.id,
        title="New title",
        description="New description",
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is True

    # Verify both updated
    updated_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )

    assert updated_task.title == "New title"
    assert updated_task.description == "New description"


@pytest.mark.asyncio
async def test_update_task_persists_to_database(async_session):
    """Test that updates persist to database.

    Acceptance Criteria:
    - Changes can be retrieved after update
    - Database reflects new values
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Original", description=None, priority="medium"
        ),
        session=async_session,
    )

    input_data = UpdateTaskInput(
        user_id=user_id, task_id=task.id, title="Updated", description=None
    )
    await update_task_handler(input_data, async_session)

    # Verify persistence
    retrieved_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )

    assert retrieved_task.title == "Updated"


@pytest.mark.asyncio
async def test_update_task_not_found(async_session):
    """Test updating a non-existent task.

    Acceptance Criteria:
    - Returns failure response
    - Error message indicates task not found
    """
    user_id = 1

    input_data = UpdateTaskInput(
        user_id=user_id, task_id=99999, title="New title", description=None
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is False
    assert "not found" in result.message.lower()


@pytest.mark.asyncio
async def test_update_task_unauthorized(async_session):
    """Test updating another user's task.

    Acceptance Criteria:
    - Returns failure response
    - Task remains unchanged for owner
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

    # Attempt to update as user2
    input_data = UpdateTaskInput(
        user_id=user2, task_id=task.id, title="Hacked title", description=None
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is False

    # Verify task unchanged for user1
    unchanged_task = await TaskService.get_task(
        task_id=task.id, user_id=user1, session=async_session
    )
    assert unchanged_task.title == "User 1 task"


@pytest.mark.asyncio
async def test_update_completed_task(async_session):
    """Test updating a completed task.

    Acceptance Criteria:
    - Completed tasks can be updated
    - Completion status is preserved
    """
    user_id = 1

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
        updates={"completed": True},
        session=async_session,
    )

    # Update title
    input_data = UpdateTaskInput(
        user_id=user_id, task_id=task.id, title="Updated completed task", description=None
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is True

    # Verify completion status preserved
    updated_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )
    assert updated_task.title == "Updated completed task"
    assert updated_task.completed is True


@pytest.mark.asyncio
async def test_update_task_clear_description(async_session):
    """Test clearing task description.

    Acceptance Criteria:
    - Description can be set to empty string or None
    - Title remains unchanged
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Task", description="Has description", priority="medium"
        ),
        session=async_session,
    )

    input_data = UpdateTaskInput(
        user_id=user_id, task_id=task.id, title=None, description=""
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is True

    # Verify description cleared
    updated_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )
    assert updated_task.description == "" or updated_task.description is None


@pytest.mark.asyncio
async def test_update_task_long_title(async_session):
    """Test updating with long title (up to 200 chars).

    Acceptance Criteria:
    - Long titles (up to 200 chars) are accepted
    - Title is stored correctly
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Short title", description=None, priority="medium"
        ),
        session=async_session,
    )

    long_title = "A" * 200

    input_data = UpdateTaskInput(
        user_id=user_id, task_id=task.id, title=long_title, description=None
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is True

    # Verify long title stored
    updated_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )
    assert len(updated_task.title) == 200


@pytest.mark.asyncio
async def test_update_task_long_description(async_session):
    """Test updating with long description (up to 1000 chars).

    Acceptance Criteria:
    - Long descriptions (up to 1000 chars) are accepted
    - Description is stored correctly
    """
    user_id = 1

    task = await TaskService.create_task(
        user_id=user_id,
        task_data=CreateTaskRequest(
            title="Task", description="Short desc", priority="medium"
        ),
        session=async_session,
    )

    long_description = "B" * 1000

    input_data = UpdateTaskInput(
        user_id=user_id, task_id=task.id, title=None, description=long_description
    )
    result = await update_task_handler(input_data, async_session)

    assert result.success is True

    # Verify long description stored
    updated_task = await TaskService.get_task(
        task_id=task.id, user_id=user_id, session=async_session
    )
    assert len(updated_task.description) == 1000


@pytest.mark.asyncio
async def test_update_task_output_format(async_session):
    """Test that update_task returns correctly formatted output.

    Acceptance Criteria:
    - Output matches UpdateTaskOutput schema
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

    input_data = UpdateTaskInput(
        user_id=user_id, task_id=task.id, title="Updated format", description=None
    )
    result = await update_task_handler(input_data, async_session)

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
