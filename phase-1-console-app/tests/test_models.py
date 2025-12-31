"""Tests for todo_app.models module."""

from datetime import datetime

import pytest

from todo_app.models import Task


class TestTaskCreation:
    """Tests for Task creation with valid data."""

    def test_task_creation_with_valid_data(self) -> None:
        """Test Task creation with id, title, description."""
        task = Task(
            id=1,
            title="Buy groceries",
            description="Milk, eggs, bread",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.description == "Milk, eggs, bread"
        assert task.completed is False

    def test_task_timestamps_are_set(self) -> None:
        """Test Task timestamps (created_at, updated_at) are set."""
        now = datetime.now()
        task = Task(
            id=1, title="Test task", description="", completed=False, created_at=now, updated_at=now
        )
        assert task.created_at == now
        assert task.updated_at == now

    def test_task_defaults_to_not_completed(self) -> None:
        """Test Task defaults to completed=False."""
        task = Task(
            id=1,
            title="Test task",
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        assert task.completed is False


class TestTaskTitleValidation:
    """Tests for Task title validation."""

    def test_empty_title_raises_error(self) -> None:
        """Test empty title raises ValueError."""
        with pytest.raises(ValueError, match="Title cannot be empty"):
            Task(
                id=1,
                title="",
                description="Test",
                completed=False,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )

    def test_title_with_200_chars_passes(self) -> None:
        """Test title with 200 chars passes."""
        title = "a" * 200
        task = Task(
            id=1,
            title=title,
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        assert len(task.title) == 200

    def test_title_with_201_chars_raises_error(self) -> None:
        """Test title with 201 chars raises ValueError."""
        title = "a" * 201
        with pytest.raises(ValueError, match="Title cannot exceed 200 characters"):
            Task(
                id=1,
                title=title,
                description="",
                completed=False,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )


class TestTaskDescriptionValidation:
    """Tests for Task description validation."""

    def test_empty_description_is_allowed(self) -> None:
        """Test empty description is allowed."""
        task = Task(
            id=1,
            title="Test task",
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        assert task.description == ""

    def test_description_with_1000_chars_passes(self) -> None:
        """Test description with 1000 chars passes."""
        description = "a" * 1000
        task = Task(
            id=1,
            title="Test task",
            description=description,
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        assert len(task.description) == 1000

    def test_description_with_1001_chars_raises_error(self) -> None:
        """Test description with 1001 chars raises ValueError."""
        description = "a" * 1001
        with pytest.raises(ValueError, match="Description cannot exceed 1000 characters"):
            Task(
                id=1,
                title="Test task",
                description=description,
                completed=False,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
