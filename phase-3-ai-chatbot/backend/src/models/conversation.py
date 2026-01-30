"""Conversation database model.

This module defines the Conversation SQLModel for database persistence.
Phase III: AI-Powered Chatbot feature.
"""

from datetime import datetime

from sqlmodel import Field, SQLModel


class Conversation(SQLModel, table=True):
    """Conversation model for chat sessions.

    Attributes:
        id: Primary key (auto-generated)
        user_id: User identifier from Better Auth (indexed)
        created_at: Conversation creation timestamp
        updated_at: Last modification timestamp (updated on new messages)
    """

    __tablename__ = "conversations"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(max_length=255, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": "auth0|123456789",
                "created_at": "2026-01-15T00:00:00Z",
                "updated_at": "2026-01-15T00:00:00Z",
            }
        }
