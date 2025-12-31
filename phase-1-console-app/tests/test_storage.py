"""Tests for todo_app.storage module."""

import pytest

from todo_app.storage import TaskStorage


class TestTaskStorageAdd:
    """Tests for TaskStorage.add() basic functionality."""

    def test_adding_first_task_assigns_id_1(self) -> None:
        """Test adding first task assigns id=1."""
        storage = TaskStorage()
        task = storage.add("Buy groceries", "Milk, eggs, bread")
        assert task.id == 1

    def test_adding_second_task_assigns_id_2(self) -> None:
        """Test adding second task assigns id=2."""
        storage = TaskStorage()
        storage.add("First task", "")
        task = storage.add("Second task", "")
        assert task.id == 2

    def test_add_returns_task_object(self) -> None:
        """Test adding task returns Task object."""
        storage = TaskStorage()
        task = storage.add("Test task", "Test description")
        assert task.title == "Test task"
        assert task.description == "Test description"

    def test_task_is_stored_in_storage(self) -> None:
        """Test task is stored in storage."""
        storage = TaskStorage()
        task = storage.add("Test task", "")
        tasks = storage.get_all()
        assert len(tasks) == 1
        assert tasks[0].id == task.id


class TestTaskStorageAddValidation:
    """Tests for TaskStorage.add() validation."""

    def test_adding_task_with_empty_title_raises_error(self) -> None:
        """Test adding task with empty title raises ValueError."""
        storage = TaskStorage()
        with pytest.raises(ValueError, match="Title cannot be empty"):
            storage.add("", "Description")

    def test_adding_task_with_title_too_long_raises_error(self) -> None:
        """Test adding task with title too long raises ValueError."""
        storage = TaskStorage()
        title = "a" * 201
        with pytest.raises(ValueError, match="Title cannot exceed 200 characters"):
            storage.add(title, "")

    def test_adding_task_with_description_too_long_raises_error(self) -> None:
        """Test adding task with description too long raises ValueError."""
        storage = TaskStorage()
        description = "a" * 1001
        with pytest.raises(ValueError, match="Description cannot exceed 1000 characters"):
            storage.add("Valid title", description)
