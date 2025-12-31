"""Storage layer for managing tasks in memory."""

from datetime import datetime

from todo_app.models import Task


class TaskStorage:
    """In-memory storage for tasks.

    Manages task persistence in memory with automatic ID assignment.

    Attributes:
        _tasks: List of all tasks.
        _next_id: Counter for assigning unique task IDs.
    """

    def __init__(self) -> None:
        """Initialize empty task storage."""
        self._tasks: list[Task] = []
        self._next_id: int = 1

    def add(self, title: str, description: str) -> Task:
        """Add a new task to storage.

        Args:
            title: Title of the task.
            description: Description of the task.

        Returns:
            The newly created task.

        Raises:
            ValueError: If validation fails.
        """
        now = datetime.now()
        task = Task(
            id=self._next_id,
            title=title,
            description=description,
            completed=False,
            created_at=now,
            updated_at=now,
        )
        self._tasks.append(task)
        self._next_id += 1
        return task

    def get_all(self) -> list[Task]:
        """Get all tasks.

        Returns:
            Copy of the tasks list.
        """
        return self._tasks.copy()

    def toggle_complete(self, task_id: int) -> Task:
        """Toggle completion status of a task.

        Args:
            task_id: ID of the task to toggle.

        Returns:
            The updated task.

        Raises:
            ValueError: If task not found.
        """
        task = self._find_task(task_id)
        task.toggle_complete()
        return task

    def update(
        self, task_id: int, title: str | None = None, description: str | None = None
    ) -> Task:
        """Update task details.

        Args:
            task_id: ID of the task to update.
            title: New title (optional).
            description: New description (optional).

        Returns:
            The updated task.

        Raises:
            ValueError: If task not found or validation fails.
        """
        task = self._find_task(task_id)
        task.update_details(title, description)
        return task

    def delete(self, task_id: int) -> None:
        """Delete a task from storage.

        Args:
            task_id: ID of the task to delete.

        Raises:
            ValueError: If task not found.
        """
        task = self._find_task(task_id)
        self._tasks.remove(task)

    def _find_task(self, task_id: int) -> Task:
        """Find a task by ID.

        Args:
            task_id: ID of the task to find.

        Returns:
            The found task.

        Raises:
            ValueError: If task not found.
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        raise ValueError(f"Task with ID {task_id} not found")
