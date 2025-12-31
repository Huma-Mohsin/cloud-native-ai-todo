"""Tests for todo_app.operations module."""

from todo_app.operations import TodoOperations
from todo_app.storage import TaskStorage


class TestTodoOperationsAddTask:
    """Tests for TodoOperations.add_task() success cases."""

    def test_add_task_with_title_and_description_succeeds(self) -> None:
        """Test add_task with valid title and description returns (Task, success_message)."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, message = operations.add_task("Buy groceries", "Milk, eggs, bread")
        assert task.title == "Buy groceries"
        assert task.description == "Milk, eggs, bread"
        assert "successfully" in message.lower()

    def test_add_task_with_only_title_succeeds(self) -> None:
        """Test add_task with only title (no description) succeeds."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, message = operations.add_task("Buy groceries", "")
        assert task.title == "Buy groceries"
        assert task.description == ""
        assert "successfully" in message.lower()

    def test_success_message_contains_task_id(self) -> None:
        """Test success message contains task ID."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, message = operations.add_task("Test task", "")
        assert str(task.id) in message


class TestTodoOperationsAddTaskErrorHandling:
    """Tests for TodoOperations.add_task() error handling."""

    def test_add_task_with_empty_title_returns_error(self) -> None:
        """Test add_task with empty title returns error message."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, message = operations.add_task("", "Description")
        assert task is None
        assert "error" in message.lower() or "cannot be empty" in message.lower()

    def test_add_task_with_title_too_long_returns_error(self) -> None:
        """Test add_task with title too long returns error message."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        title = "a" * 201
        task, message = operations.add_task(title, "")
        assert task is None
        assert "error" in message.lower() or "cannot exceed" in message.lower()

    def test_error_messages_are_user_friendly(self) -> None:
        """Test error messages are user-friendly (no stack traces)."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, message = operations.add_task("", "")
        assert task is None
        assert "Traceback" not in message
        assert len(message) < 200  # Should be concise
