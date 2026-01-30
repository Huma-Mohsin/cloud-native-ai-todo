"""Integration tests for add_task MCP tool.

Phase III: AI-Powered Chatbot - T021
Tests add_task tool with real database operations.
"""

import pytest

from src.mcp.tools.add_task import add_task_handler
from src.mcp.schemas import AddTaskInput
from src.services.task_service import TaskService


@pytest.mark.asyncio
async def test_add_task_success(async_session):
    """Test adding a task successfully.

    Acceptance Criteria:
    - Task is created in database
    - Success response is returned
    - Task ID and title are included
    """
    user_id = 1  # Task table uses integer user IDs
    input_data = AddTaskInput(
        user_id=user_id, title="Buy groceries", description="Milk, eggs, bread"
    )

    result = await add_task_handler(input_data, async_session)

    assert result.success is True
    assert result.task_id is not None
    assert result.title == "Buy groceries"
    assert "Task created successfully" in result.message
    assert f"ID: {result.task_id}" in result.message


@pytest.mark.asyncio
async def test_add_task_without_description(async_session):
    """Test adding a task without description.

    Acceptance Criteria:
    - Task is created with only title
    - Description is optional
    """
    user_id = 1
    input_data = AddTaskInput(user_id=user_id, title="Call mom", description=None)

    result = await add_task_handler(input_data, async_session)

    assert result.success is True
    assert result.title == "Call mom"


@pytest.mark.asyncio
async def test_add_task_persists_to_database(async_session):
    """Test that added task is persisted to database.

    Acceptance Criteria:
    - Task can be retrieved from database
    - All fields are correctly stored
    """
    user_id = 1
    input_data = AddTaskInput(
        user_id=user_id, title="Complete project", description="Finish Phase III"
    )

    result = await add_task_handler(input_data, async_session)

    # Verify task exists in database
    task = await TaskService.get_task(
        task_id=result.task_id, user_id=user_id, session=async_session
    )

    assert task is not None
    assert task.title == "Complete project"
    assert task.description == "Finish Phase III"
    assert task.user_id == user_id
    assert task.completed is False


@pytest.mark.asyncio
async def test_add_task_user_isolation(async_session):
    """Test that tasks are isolated by user.

    Acceptance Criteria:
    - Task is associated with correct user
    - Other users cannot access the task
    """
    user1 = 1
    user2 = 2

    input_data = AddTaskInput(user_id=user1, title="User 1 task", description=None)

    result = await add_task_handler(input_data, async_session)

    # Verify user1 can access the task
    task1 = await TaskService.get_task(
        task_id=result.task_id, user_id=user1, session=async_session
    )
    assert task1 is not None

    # Verify user2 cannot access the task
    task2 = await TaskService.get_task(
        task_id=result.task_id, user_id=user2, session=async_session
    )
    assert task2 is None


@pytest.mark.asyncio
async def test_add_multiple_tasks(async_session):
    """Test adding multiple tasks for the same user.

    Acceptance Criteria:
    - Multiple tasks can be created
    - Each task has unique ID
    - All tasks are associated with user
    """
    user_id = 1
    tasks = [
        AddTaskInput(user_id=user_id, title="Task 1", description=None),
        AddTaskInput(user_id=user_id, title="Task 2", description=None),
        AddTaskInput(user_id=user_id, title="Task 3", description=None),
    ]

    results = []
    for task_input in tasks:
        result = await add_task_handler(task_input, async_session)
        results.append(result)

    # Verify all tasks created successfully
    assert all(r.success for r in results)

    # Verify unique IDs
    task_ids = [r.task_id for r in results]
    assert len(set(task_ids)) == 3

    # Verify all tasks can be retrieved
    user_tasks = await TaskService.list_tasks(
        user_id=user_id, session=async_session, filters={}
    )
    assert len(user_tasks) == 3


@pytest.mark.asyncio
async def test_add_task_with_long_title(async_session):
    """Test adding task with long title (up to 200 chars).

    Acceptance Criteria:
    - Long titles (up to 200 chars) are accepted
    - Title is stored correctly
    """
    user_id = 1
    long_title = "A" * 200  # 200 character title

    input_data = AddTaskInput(user_id=user_id, title=long_title, description=None)

    result = await add_task_handler(input_data, async_session)

    assert result.success is True
    assert len(result.title) == 200


@pytest.mark.asyncio
async def test_add_task_with_long_description(async_session):
    """Test adding task with long description (up to 1000 chars).

    Acceptance Criteria:
    - Long descriptions (up to 1000 chars) are accepted
    - Description is stored correctly
    """
    user_id = 1
    long_description = "B" * 1000  # 1000 character description

    input_data = AddTaskInput(
        user_id=user_id, title="Test task", description=long_description
    )

    result = await add_task_handler(input_data, async_session)

    assert result.success is True

    # Verify description is stored
    task = await TaskService.get_task(
        task_id=result.task_id, user_id=user_id, session=async_session
    )
    assert len(task.description) == 1000


@pytest.mark.asyncio
async def test_add_task_default_values(async_session):
    """Test that task is created with correct default values.

    Acceptance Criteria:
    - Priority defaults to 'medium'
    - Completed defaults to False
    - Timestamps are set
    """
    user_id = 1
    input_data = AddTaskInput(user_id=user_id, title="Test task", description=None)

    result = await add_task_handler(input_data, async_session)

    # Verify defaults
    task = await TaskService.get_task(
        task_id=result.task_id, user_id=user_id, session=async_session
    )

    assert task.priority == "medium"
    assert task.completed is False
    assert task.created_at is not None
    assert task.updated_at is not None


@pytest.mark.asyncio
async def test_add_task_output_format(async_session):
    """Test that add_task returns correctly formatted output.

    Acceptance Criteria:
    - Output matches AddTaskOutput schema
    - All required fields are present
    - Message includes task title and ID
    """
    user_id = 1
    input_data = AddTaskInput(
        user_id=user_id, title="Format test", description="Testing output format"
    )

    result = await add_task_handler(input_data, async_session)

    # Verify output structure
    assert hasattr(result, "success")
    assert hasattr(result, "task_id")
    assert hasattr(result, "title")
    assert hasattr(result, "message")

    # Verify output values
    assert result.success is True
    assert isinstance(result.task_id, int)
    assert result.title == "Format test"
    assert "Format test" in result.message
    assert str(result.task_id) in result.message
