"""Additional tests for todo_app.operations module (US3-US5)."""

from todo_app.operations import TodoOperations
from todo_app.storage import TaskStorage


class TestTodoOperationsToggleTaskComplete:
    """Tests for TodoOperations.toggle_task_complete()."""

    def test_toggle_task_complete_returns_task_and_message(self) -> None:
        """Test toggle_task_complete(id) returns (Task, success_message)."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, _ = operations.add_task("Test task", "")

        result_task, message = operations.toggle_task_complete(task.id)  # type: ignore
        assert result_task is not None
        assert "successfully" in message.lower() or "marked" in message.lower()

    def test_success_message_indicates_new_status(self) -> None:
        """Test success message indicates new status (completed or pending)."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, _ = operations.add_task("Test task", "")

        # Toggle to completed
        _, message = operations.toggle_task_complete(task.id)  # type: ignore
        assert "completed" in message.lower()

        # Toggle back to pending
        _, message = operations.toggle_task_complete(task.id)  # type: ignore
        assert "pending" in message.lower()

    def test_toggle_task_complete_invalid_id_returns_error(self) -> None:
        """Test toggle_task_complete(invalid_id) returns user-friendly error."""
        storage = TaskStorage()
        operations = TodoOperations(storage)

        task, message = operations.toggle_task_complete(999)
        assert task is None
        assert "error" in message.lower() or "not found" in message.lower()


class TestTodoOperationsUpdateTask:
    """Tests for TodoOperations.update_task()."""

    def test_update_task_returns_task_and_message(self) -> None:
        """Test update_task(id, title, description) returns (Task, success_message)."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, _ = operations.add_task("Old title", "Old desc")

        result_task, message = operations.update_task(task.id, "New title", "New desc")  # type: ignore
        assert result_task is not None
        assert "successfully" in message.lower() or "updated" in message.lower()

    def test_update_task_with_none_values_keeps_existing(self) -> None:
        """Test update_task with None values keeps existing values."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, _ = operations.add_task("Original title", "Original desc")

        # Update only title
        result_task, _ = operations.update_task(task.id, "New title", None)  # type: ignore
        assert result_task.title == "New title"  # type: ignore
        assert result_task.description == "Original desc"  # type: ignore

    def test_update_task_invalid_id_returns_error(self) -> None:
        """Test update_task(invalid_id) returns user-friendly error."""
        storage = TaskStorage()
        operations = TodoOperations(storage)

        task, message = operations.update_task(999, "Title", "Desc")
        assert task is None
        assert "error" in message.lower() or "not found" in message.lower()

    def test_update_task_with_empty_title_returns_error(self) -> None:
        """Test update_task with empty title returns error."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, _ = operations.add_task("Valid title", "")

        result_task, message = operations.update_task(task.id, "", None)  # type: ignore
        assert result_task is None
        assert "error" in message.lower()


class TestTodoOperationsDeleteTask:
    """Tests for TodoOperations.delete_task()."""

    def test_delete_task_returns_success_message(self) -> None:
        """Test delete_task(id) returns success message."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, _ = operations.add_task("Test task", "")

        _, message = operations.delete_task(task.id)  # type: ignore
        assert "successfully" in message.lower() or "deleted" in message.lower()

    def test_success_message_includes_task_id(self) -> None:
        """Test success message includes task ID."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, _ = operations.add_task("Test task", "")

        _, message = operations.delete_task(task.id)  # type: ignore
        assert str(task.id) in message  # type: ignore

    def test_delete_task_invalid_id_returns_error(self) -> None:
        """Test delete_task(invalid_id) returns user-friendly error."""
        storage = TaskStorage()
        operations = TodoOperations(storage)

        _, message = operations.delete_task(999)
        assert "error" in message.lower() or "not found" in message.lower()
