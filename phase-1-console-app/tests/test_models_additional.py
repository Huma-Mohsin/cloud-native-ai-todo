"""Additional tests for todo_app.models module (US3-US5)."""

import time
from datetime import datetime

import pytest

from todo_app.models import Task


class TestTaskToggleComplete:
    """Tests for Task.toggle_complete()."""

    def test_toggle_pending_to_completed(self) -> None:
        """Test toggle_complete() on pending task sets completed=True."""
        task = Task(
            id=1,
            title="Test",
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        task.toggle_complete()
        assert task.completed is True

    def test_toggle_completed_to_pending(self) -> None:
        """Test toggle_complete() on completed task sets completed=False."""
        task = Task(
            id=1,
            title="Test",
            description="",
            completed=True,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        task.toggle_complete()
        assert task.completed is False

    def test_toggle_updates_timestamp(self) -> None:
        """Test toggle_complete() updates updated_at timestamp."""
        task = Task(
            id=1,
            title="Test",
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        old_updated = task.updated_at
        time.sleep(0.01)
        task.toggle_complete()
        assert task.updated_at > old_updated


class TestTaskUpdateDetails:
    """Tests for Task.update_details()."""

    def test_update_title_only(self) -> None:
        """Test update_details(title) updates title only."""
        task = Task(
            id=1,
            title="Old title",
            description="Old desc",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        task.update_details(title="New title")
        assert task.title == "New title"
        assert task.description == "Old desc"

    def test_update_description_only(self) -> None:
        """Test update_details(description) updates description only."""
        task = Task(
            id=1,
            title="Title",
            description="Old desc",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        task.update_details(description="New desc")
        assert task.title == "Title"
        assert task.description == "New desc"

    def test_update_both_fields(self) -> None:
        """Test update_details(title, description) updates both."""
        task = Task(
            id=1,
            title="Old",
            description="Old",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        task.update_details(title="New title", description="New desc")
        assert task.title == "New title"
        assert task.description == "New desc"

    def test_update_validates_title_not_empty(self) -> None:
        """Test update_details validates title (not empty)."""
        task = Task(
            id=1,
            title="Valid",
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        with pytest.raises(ValueError, match="Title cannot be empty"):
            task.update_details(title="")

    def test_update_validates_title_max_length(self) -> None:
        """Test update_details validates title (max 200 chars)."""
        task = Task(
            id=1,
            title="Valid",
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        with pytest.raises(ValueError, match="Title cannot exceed 200 characters"):
            task.update_details(title="a" * 201)

    def test_update_validates_description_max_length(self) -> None:
        """Test update_details validates description (max 1000 chars)."""
        task = Task(
            id=1,
            title="Valid",
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        with pytest.raises(ValueError, match="Description cannot exceed 1000 characters"):
            task.update_details(description="a" * 1001)

    def test_update_updates_timestamp(self) -> None:
        """Test update_details updates updated_at timestamp."""
        task = Task(
            id=1,
            title="Test",
            description="",
            completed=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        old_updated = task.updated_at
        time.sleep(0.01)
        task.update_details(title="New title")
        assert task.updated_at > old_updated
