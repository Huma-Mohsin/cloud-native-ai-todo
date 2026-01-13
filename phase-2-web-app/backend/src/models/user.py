"""User database model.

This module defines the User SQLModel for database persistence.
"""

from datetime import datetime

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """User model for authentication and identification.

    Attributes:
        id: Primary key (auto-generated UUID)
        name: User's full name
        email: Unique email address (used for login)
        password: Hashed password (never store plaintext!)
        created_at: Account creation timestamp
    """

    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100, index=False)
    email: str = Field(unique=True, index=True, max_length=255)
    password: str = Field(min_length=1)  # Stored as bcrypt hash
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Ahmed Khan",
                "email": "ahmed@example.com",
                "password": "$2b$12$...",  # bcrypt hash
                "created_at": "2024-01-01T00:00:00Z",
            }
        }
