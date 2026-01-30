"""MCP (Model Context Protocol) package initialization.

Phase III: AI-Powered Chatbot - MCP Server and Tools
"""

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
    TaskInfo,
)
from .tools import (
    add_task_handler,
    list_tasks_handler,
    complete_task_handler,
    delete_task_handler,
    update_task_handler,
)

__all__ = [
    "AddTaskInput",
    "AddTaskOutput",
    "ListTasksInput",
    "ListTasksOutput",
    "CompleteTaskInput",
    "CompleteTaskOutput",
    "DeleteTaskInput",
    "DeleteTaskOutput",
    "UpdateTaskInput",
    "UpdateTaskOutput",
    "TaskInfo",
    "add_task_handler",
    "list_tasks_handler",
    "complete_task_handler",
    "delete_task_handler",
    "update_task_handler",
]
