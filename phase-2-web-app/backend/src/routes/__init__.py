"""Routes package.

This package contains API route handlers for the application.
"""

from .auth import router as auth_router
from .tasks import router as tasks_router
from .subtasks import router as subtasks_router

__all__ = ["auth_router", "tasks_router", "subtasks_router"]
