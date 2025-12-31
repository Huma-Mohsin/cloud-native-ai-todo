"""Data models for the Todo application."""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Task:
    """Represents a todo task.

    Attributes:
        id: Unique identifier for the task.
        title: Title of the task (1-200 characters, required).
        description: Optional description of the task (max 1000 characters).
        completed: Whether the task is completed (default: False).
        created_at: Timestamp when the task was created.
        updated_at: Timestamp when the task was last updated.

    Raises:
        ValueError: If title is empty or exceeds 200 characters.
        ValueError: If description exceeds 1000 characters.
    """

    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    def __post_init__(self) -> None:
        """Validate task data after initialization.

        Raises:
            ValueError: If validation fails.
        """
        # Validate title
        if not self.title or len(self.title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        if len(self.title) > 200:
            raise ValueError("Title cannot exceed 200 characters")

        # Validate description
        if len(self.description) > 1000:
            raise ValueError("Description cannot exceed 1000 characters")

    def toggle_complete(self) -> None:
        """Toggle the completion status of the task."""
        self.completed = not self.completed
        self.updated_at = datetime.now()

    def update_details(self, title: str | None = None, description: str | None = None) -> None:
        """Update task title and/or description.

        Args:
            title: New title for the task (optional).
            description: New description for the task (optional).

        Raises:
            ValueError: If validation fails.
        """
        if title is not None:
            if not title or len(title.strip()) == 0:
                raise ValueError("Title cannot be empty")
            if len(title) > 200:
                raise ValueError("Title cannot exceed 200 characters")
            self.title = title

        if description is not None:
            if len(description) > 1000:
                raise ValueError("Description cannot exceed 1000 characters")
            self.description = description

        self.updated_at = datetime.now()
