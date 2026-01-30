"""Message database model.

This module defines the Message SQLModel for database persistence.
Phase III: AI-Powered Chatbot feature.
"""

from datetime import datetime
from typing import Literal

from sqlmodel import Field, SQLModel

# Type alias for message role values
RoleType = Literal["user", "assistant"]


class Message(SQLModel, table=True):
    """Message model for chat messages.

    Attributes:
        id: Primary key (auto-generated)
        conversation_id: Foreign key to Conversation (indexed)
        user_id: User identifier from Better Auth (indexed)
        role: Message sender role ('user' or 'assistant')
        content: Message text content
        created_at: Message creation timestamp
    """

    __tablename__ = "messages"

    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: str = Field(max_length=255, index=True)
    role: str = Field(max_length=20)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "id": 1,
                "conversation_id": 1,
                "user_id": "auth0|123456789",
                "role": "user",
                "content": "Add a task to buy groceries",
                "created_at": "2026-01-15T00:00:00Z",
            }
        }
