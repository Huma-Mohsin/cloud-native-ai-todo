"""Business logic operations for the Todo application."""

from todo_app.models import Task
from todo_app.storage import TaskStorage


class TodoOperations:
    """High-level operations for managing todos.

    Provides user-friendly interface with error handling for task operations.

    Attributes:
        storage: TaskStorage instance for persistence.
    """

    def __init__(self, storage: TaskStorage) -> None:
        """Initialize operations with storage.

        Args:
            storage: TaskStorage instance.
        """
        self.storage = storage

    def add_task(self, title: str, description: str) -> tuple[Task | None, str]:
        """Add a new task.

        Args:
            title: Title of the task.
            description: Description of the task.

        Returns:
            Tuple of (Task, success_message) or (None, error_message).
        """
        try:
            task = self.storage.add(title, description)
            message = f"Task #{task.id} created successfully: {task.title}"
            return task, message
        except ValueError as e:
            return None, f"Error: {str(e)}"

    def list_tasks(self) -> list[Task]:
        """Get all tasks.

        Returns:
            List of all tasks sorted by ID.
        """
        return self.storage.get_all()

    def toggle_task_complete(self, task_id: int) -> tuple[Task | None, str]:
        """Toggle task completion status.

        Args:
            task_id: ID of the task to toggle.

        Returns:
            Tuple of (Task, success_message) or (None, error_message).
        """
        try:
            task = self.storage.toggle_complete(task_id)
            status = "completed" if task.completed else "pending"
            message = f"Task #{task.id} marked as {status}: {task.title}"
            return task, message
        except ValueError as e:
            return None, f"Error: {str(e)}"

    def update_task(
        self, task_id: int, title: str | None = None, description: str | None = None
    ) -> tuple[Task | None, str]:
        """Update task details.

        Args:
            task_id: ID of the task to update.
            title: New title (optional).
            description: New description (optional).

        Returns:
            Tuple of (Task, success_message) or (None, error_message).
        """
        try:
            task = self.storage.update(task_id, title, description)
            message = f"Task #{task.id} updated successfully: {task.title}"
            return task, message
        except ValueError as e:
            return None, f"Error: {str(e)}"

    def delete_task(self, task_id: int) -> tuple[None, str]:
        """Delete a task.

        Args:
            task_id: ID of the task to delete.

        Returns:
            Tuple of (None, success_message) or (None, error_message).
        """
        try:
            self.storage.delete(task_id)
            message = f"Task #{task_id} deleted successfully"
            return None, message
        except ValueError as e:
            return None, f"Error: {str(e)}"
