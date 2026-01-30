"""Unit tests for MCP tools.

Phase III: AI-Powered Chatbot - MCP Tool Testing
"""

import pytest
from src.mcp.schemas import (
    AddTaskInput,
    AddTaskOutput,
    ListTasksInput,
    ListTasksOutput,
    CompleteTaskInput,
    CompleteTaskOutput,
    DeleteTaskInput,
    DeleteTaskOutput,
    UpdateTaskInput,
    UpdateTaskOutput,
    TaskInfo,
)
from src.mcp.tools.add_task import add_task_handler
from src.mcp.server import MCPServer, get_mcp_server


class TestAddTaskSchema:
    """Test suite for AddTaskInput and AddTaskOutput schemas."""

    def test_add_task_input_valid(self):
        """Test creating valid AddTaskInput."""
        input_data = AddTaskInput(
            user_id="auth0|123456789",
            title="Buy groceries",
            description="milk, eggs, bread"
        )

        assert input_data.user_id == "auth0|123456789"
        assert input_data.title == "Buy groceries"
        assert input_data.description == "milk, eggs, bread"

    def test_add_task_input_without_description(self):
        """Test AddTaskInput without optional description."""
        input_data = AddTaskInput(
            user_id="auth0|123456789",
            title="Call mom"
        )

        assert input_data.user_id == "auth0|123456789"
        assert input_data.title == "Call mom"
        assert input_data.description is None

    def test_add_task_input_title_required(self):
        """Test that title is required."""
        with pytest.raises(Exception):
            AddTaskInput(user_id="auth0|123456789")

    def test_add_task_input_title_min_length(self):
        """Test title minimum length validation."""
        with pytest.raises(Exception):
            AddTaskInput(
                user_id="auth0|123456789",
                title=""  # Empty title should fail
            )

    def test_add_task_input_title_max_length(self):
        """Test title maximum length validation."""
        long_title = "A" * 201  # 201 characters, exceeds max of 200
        with pytest.raises(Exception):
            AddTaskInput(
                user_id="auth0|123456789",
                title=long_title
            )

    def test_add_task_input_description_max_length(self):
        """Test description maximum length validation."""
        long_description = "A" * 1001  # 1001 characters, exceeds max of 1000
        with pytest.raises(Exception):
            AddTaskInput(
                user_id="auth0|123456789",
                title="Test",
                description=long_description
            )

    def test_add_task_output_success(self):
        """Test creating successful AddTaskOutput."""
        output = AddTaskOutput(
            success=True,
            task_id=42,
            title="Buy groceries",
            message="Task created successfully: Buy groceries (ID: 42)"
        )

        assert output.success is True
        assert output.task_id == 42
        assert output.title == "Buy groceries"
        assert "Task created successfully" in output.message

    def test_add_task_output_failure(self):
        """Test creating failure AddTaskOutput."""
        output = AddTaskOutput(
            success=False,
            task_id=None,
            title=None,
            message="Failed to create task: Database error"
        )

        assert output.success is False
        assert output.task_id is None
        assert output.title is None
        assert "Failed to create task" in output.message


class TestAddTaskHandler:
    """Test suite for add_task_handler function."""

    @pytest.mark.asyncio
    async def test_add_task_handler_success(self, async_session):
        """Test successful task creation via add_task_handler."""
        input_data = AddTaskInput(
            user_id="auth0|test123",
            title="Buy groceries",
            description="milk, eggs, bread"
        )

        output = await add_task_handler(input_data, async_session)

        assert output.success is True
        assert output.task_id is not None
        assert output.task_id > 0
        assert output.title == "Buy groceries"
        assert "Task created successfully" in output.message
        assert str(output.task_id) in output.message

    @pytest.mark.asyncio
    async def test_add_task_handler_without_description(self, async_session):
        """Test task creation without description."""
        input_data = AddTaskInput(
            user_id="auth0|test456",
            title="Call mom"
        )

        output = await add_task_handler(input_data, async_session)

        assert output.success is True
        assert output.task_id is not None
        assert output.title == "Call mom"

    @pytest.mark.asyncio
    async def test_add_task_handler_multiple_tasks(self, async_session):
        """Test creating multiple tasks for same user."""
        user_id = "auth0|multitest"

        # Create first task
        input1 = AddTaskInput(user_id=user_id, title="Task 1")
        output1 = await add_task_handler(input1, async_session)

        # Create second task
        input2 = AddTaskInput(user_id=user_id, title="Task 2")
        output2 = await add_task_handler(input2, async_session)

        assert output1.success is True
        assert output2.success is True
        assert output1.task_id != output2.task_id

    @pytest.mark.asyncio
    async def test_add_task_handler_different_users(self, async_session):
        """Test creating tasks for different users."""
        # Create task for user 1
        input1 = AddTaskInput(user_id="auth0|user1", title="User 1 Task")
        output1 = await add_task_handler(input1, async_session)

        # Create task for user 2
        input2 = AddTaskInput(user_id="auth0|user2", title="User 2 Task")
        output2 = await add_task_handler(input2, async_session)

        assert output1.success is True
        assert output2.success is True
        assert output1.task_id != output2.task_id


class TestMCPServer:
    """Test suite for MCPServer class."""

    def test_mcp_server_initialization(self):
        """Test MCPServer initializes with registered tools."""
        server = MCPServer()

        assert "add_task" in server.tools
        assert server.tools["add_task"]["name"] == "add_task"
        assert "description" in server.tools["add_task"]
        assert "handler" in server.tools["add_task"]

    def test_mcp_server_list_tools(self):
        """Test listing registered tools."""
        server = MCPServer()
        tools = server.list_tools()

        assert "add_task" in tools
        assert isinstance(tools, list)

    def test_mcp_server_get_tool_definitions(self):
        """Test getting OpenAI-compatible tool definitions."""
        server = MCPServer()
        definitions = server.get_tool_definitions()

        assert len(definitions) > 0
        assert any(d["function"]["name"] == "add_task" for d in definitions)

        # Check add_task definition structure
        add_task_def = next(d for d in definitions if d["function"]["name"] == "add_task")
        assert add_task_def["type"] == "function"
        assert "description" in add_task_def["function"]
        assert "parameters" in add_task_def["function"]

    @pytest.mark.asyncio
    async def test_mcp_server_call_tool_add_task(self, async_session):
        """Test calling add_task tool via MCPServer."""
        server = MCPServer()

        arguments = {
            "user_id": "auth0|servertest",
            "title": "Test task via server",
            "description": "Testing MCP server"
        }

        result = await server.call_tool("add_task", arguments, async_session)

        assert result["success"] is True
        assert result["task_id"] is not None
        assert result["title"] == "Test task via server"

    @pytest.mark.asyncio
    async def test_mcp_server_call_invalid_tool(self, async_session):
        """Test calling non-existent tool raises error."""
        server = MCPServer()

        with pytest.raises(ValueError, match="not registered"):
            await server.call_tool("invalid_tool", {}, async_session)

    def test_get_mcp_server_singleton(self):
        """Test get_mcp_server returns singleton instance."""
        server1 = get_mcp_server()
        server2 = get_mcp_server()

        assert server1 is server2
        assert isinstance(server1, MCPServer)


class TestTaskInfoSchema:
    """Test suite for TaskInfo schema."""

    def test_task_info_creation(self):
        """Test creating TaskInfo."""
        task_info = TaskInfo(
            id=1,
            title="Test task",
            description="Test description",
            completed=False
        )

        assert task_info.id == 1
        assert task_info.title == "Test task"
        assert task_info.description == "Test description"
        assert task_info.completed is False

    def test_task_info_without_description(self):
        """Test TaskInfo without description."""
        task_info = TaskInfo(
            id=2,
            title="Test task",
            description=None,
            completed=True
        )

        assert task_info.id == 2
        assert task_info.description is None
        assert task_info.completed is True
