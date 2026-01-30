"""MCP Server for Phase III AI-Powered Chatbot.

This module provides the MCP (Model Context Protocol) server that exposes
task management tools to the OpenAI agent.
"""

from typing import Any, Callable
from sqlalchemy.ext.asyncio import AsyncSession

from .schemas import (
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
)
from .tools import (
    add_task_handler,
    list_tasks_handler,
    complete_task_handler,
    delete_task_handler,
    update_task_handler,
)


class MCPServer:
    """MCP Server for task management tools.

    This server registers and manages MCP tools that can be called by the
    OpenAI agent for task management operations.
    """

    def __init__(self):
        """Initialize the MCP server with registered tools."""
        self.tools: dict[str, dict[str, Any]] = {}
        self._register_tools()

    def _register_tools(self):
        """Register all MCP tools with their schemas and handlers."""
        # Register add_task tool
        self.tools["add_task"] = {
            "name": "add_task",
            "description": "Create a new task for the user. Use this when the user wants to add, create, or remember something.",
            "input_schema": AddTaskInput.model_json_schema(),
            "output_schema": AddTaskOutput.model_json_schema(),
            "handler": add_task_handler,
        }

        # Register list_tasks tool
        self.tools["list_tasks"] = {
            "name": "list_tasks",
            "description": "List tasks for the user. Can filter by status (completed, pending, or all). Use this when the user asks to see their tasks.",
            "input_schema": ListTasksInput.model_json_schema(),
            "output_schema": ListTasksOutput.model_json_schema(),
            "handler": list_tasks_handler,
        }

        # Register complete_task tool
        self.tools["complete_task"] = {
            "name": "complete_task",
            "description": "Mark a task as completed. Use this when the user says they finished or completed a task.",
            "input_schema": CompleteTaskInput.model_json_schema(),
            "output_schema": CompleteTaskOutput.model_json_schema(),
            "handler": complete_task_handler,
        }

        # Register delete_task tool
        self.tools["delete_task"] = {
            "name": "delete_task",
            "description": "Delete a task permanently. Use this when the user wants to remove or delete a task.",
            "input_schema": DeleteTaskInput.model_json_schema(),
            "output_schema": DeleteTaskOutput.model_json_schema(),
            "handler": delete_task_handler,
        }

        # Register update_task tool
        self.tools["update_task"] = {
            "name": "update_task",
            "description": "Update a task's title or description. Use this when the user wants to modify or change a task.",
            "input_schema": UpdateTaskInput.model_json_schema(),
            "output_schema": UpdateTaskOutput.model_json_schema(),
            "handler": update_task_handler,
        }

    def get_tool_definitions(self) -> list[dict[str, Any]]:
        """Get OpenAI-compatible tool definitions.

        Returns:
            List of tool definitions in OpenAI function calling format
        """
        definitions = []
        for tool_name, tool_info in self.tools.items():
            definitions.append({
                "type": "function",
                "function": {
                    "name": tool_name,
                    "description": tool_info["description"],
                    "parameters": tool_info["input_schema"],
                },
            })
        return definitions

    async def call_tool(
        self, tool_name: str, arguments: dict[str, Any], session: AsyncSession
    ) -> dict[str, Any]:
        """Call a registered MCP tool.

        Args:
            tool_name: Name of the tool to call
            arguments: Tool arguments as a dictionary
            session: Database session

        Returns:
            Tool output as a dictionary

        Raises:
            ValueError: If tool is not registered
        """
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' is not registered")

        tool_info = self.tools[tool_name]
        handler = tool_info["handler"]

        # Parse input using Pydantic schema
        if tool_name == "add_task":
            input_data = AddTaskInput(**arguments)
            output = await handler(input_data, session)
            return output.model_dump()
        elif tool_name == "list_tasks":
            input_data = ListTasksInput(**arguments)
            output = await handler(input_data, session)
            return output.model_dump()
        elif tool_name == "complete_task":
            input_data = CompleteTaskInput(**arguments)
            output = await handler(input_data, session)
            return output.model_dump()
        elif tool_name == "delete_task":
            input_data = DeleteTaskInput(**arguments)
            output = await handler(input_data, session)
            return output.model_dump()
        elif tool_name == "update_task":
            input_data = UpdateTaskInput(**arguments)
            output = await handler(input_data, session)
            return output.model_dump()

        raise ValueError(f"Handler not implemented for tool '{tool_name}'")

    def list_tools(self) -> list[str]:
        """List all registered tool names.

        Returns:
            List of tool names
        """
        return list(self.tools.keys())


# Global MCP server instance
mcp_server = MCPServer()


def get_mcp_server() -> MCPServer:
    """Get the global MCP server instance.

    Returns:
        MCPServer instance
    """
    return mcp_server
