"""Additional tests for todo_app.storage module (US3-US5)."""

import pytest

from todo_app.storage import TaskStorage


class TestTaskStorageToggleComplete:
    """Tests for TaskStorage.toggle_complete()."""

    def test_toggle_complete_toggles_existing_task(self) -> None:
        """Test toggle_complete(id) toggles existing task."""
        storage = TaskStorage()
        task = storage.add("Test task", "")
        assert task.completed is False

        updated = storage.toggle_complete(task.id)
        assert updated.completed is True

    def test_toggle_complete_returns_updated_task(self) -> None:
        """Test toggle_complete(id) returns updated Task."""
        storage = TaskStorage()
        task = storage.add("Test task", "")

        updated = storage.toggle_complete(task.id)
        assert updated.id == task.id
        assert updated.title == task.title

    def test_toggle_complete_invalid_id_raises_error(self) -> None:
        """Test toggle_complete(invalid_id) raises ValueError."""
        storage = TaskStorage()
        with pytest.raises(ValueError, match="Task with ID 999 not found"):
            storage.toggle_complete(999)


class TestTaskStorageUpdate:
    """Tests for TaskStorage.update()."""

    def test_update_task_title(self) -> None:
        """Test update(id, title) updates task title."""
        storage = TaskStorage()
        task = storage.add("Old title", "Description")

        updated = storage.update(task.id, title="New title")
        assert updated.title == "New title"
        assert updated.description == "Description"

    def test_update_task_description(self) -> None:
        """Test update(id, description) updates task description."""
        storage = TaskStorage()
        task = storage.add("Title", "Old desc")

        updated = storage.update(task.id, description="New desc")
        assert updated.title == "Title"
        assert updated.description == "New desc"

    def test_update_both_title_and_description(self) -> None:
        """Test update(id, title, description) updates both."""
        storage = TaskStorage()
        task = storage.add("Old", "Old")

        updated = storage.update(task.id, title="New title", description="New desc")
        assert updated.title == "New title"
        assert updated.description == "New desc"

    def test_update_invalid_id_raises_error(self) -> None:
        """Test update(invalid_id) raises ValueError."""
        storage = TaskStorage()
        with pytest.raises(ValueError, match="Task with ID 999 not found"):
            storage.update(999, title="New title")

    def test_updated_task_remains_in_storage(self) -> None:
        """Test updated task remains in storage at same position."""
        storage = TaskStorage()
        _task1 = storage.add("Task 1", "")
        task2 = storage.add("Task 2", "")
        _task3 = storage.add("Task 3", "")

        storage.update(task2.id, title="Task 2 Updated")

        all_tasks = storage.get_all()
        assert len(all_tasks) == 3
        assert all_tasks[1].title == "Task 2 Updated"


class TestTaskStorageDelete:
    """Tests for TaskStorage.delete()."""

    def test_delete_removes_task_from_storage(self) -> None:
        """Test delete(id) removes task from storage."""
        storage = TaskStorage()
        task = storage.add("Test task", "")
        assert len(storage.get_all()) == 1

        storage.delete(task.id)
        assert len(storage.get_all()) == 0

    def test_delete_doesnt_affect_other_tasks(self) -> None:
        """Test delete(id) doesn't affect other tasks."""
        storage = TaskStorage()
        task1 = storage.add("Task 1", "")
        task2 = storage.add("Task 2", "")
        task3 = storage.add("Task 3", "")

        storage.delete(task2.id)

        all_tasks = storage.get_all()
        assert len(all_tasks) == 2
        assert all_tasks[0].id == task1.id
        assert all_tasks[1].id == task3.id

    def test_delete_invalid_id_raises_error(self) -> None:
        """Test delete(invalid_id) raises ValueError."""
        storage = TaskStorage()
        with pytest.raises(ValueError, match="Task with ID 999 not found"):
            storage.delete(999)

    def test_deleted_id_not_reused(self) -> None:
        """Test deleted ID is not reused for new tasks."""
        storage = TaskStorage()
        task1 = storage.add("Task 1", "")
        _task2 = storage.add("Task 2", "")

        storage.delete(task1.id)
        task3 = storage.add("Task 3", "")

        assert task3.id == 3  # ID continues from 2, not reusing 1
