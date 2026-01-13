"""User API schemas for request/response validation.

This module defines Pydantic schemas for user-related API operations.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """Request schema for user signup.

    Attributes:
        name: User's full name (1-100 characters)
        email: Valid email address
        password: Password (minimum 8 characters)
    """

    name: str = Field(min_length=1, max_length=100, description="User's full name")
    email: EmailStr = Field(description="Valid email address")
    password: str = Field(min_length=8, description="Password (min 8 characters)")

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "name": "Ahmed Khan",
                "email": "ahmed@example.com",
                "password": "SecurePass123!",
            }
        }


class LoginRequest(BaseModel):
    """Request schema for user login.

    Attributes:
        email: Registered email address
        password: User's password
    """

    email: EmailStr = Field(description="Registered email address")
    password: str = Field(min_length=1, description="User's password")

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "email": "ahmed@example.com",
                "password": "SecurePass123!",
            }
        }


class UserResponse(BaseModel):
    """Response schema for user data (excludes password).

    Attributes:
        id: User ID
        name: User's full name
        email: User's email address
        created_at: Account creation timestamp
    """

    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        """Pydantic model configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Ahmed Khan",
                "email": "ahmed@example.com",
                "created_at": "2024-01-01T00:00:00Z",
            }
        }


class TokenResponse(BaseModel):
    """Response schema for JWT token.

    Attributes:
        access_token: JWT access token
        token_type: Token type (always "bearer")
        user: User information
    """

    access_token: str = Field(description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(description="User information")

    class Config:
        """Pydantic model configuration."""

        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "name": "Ahmed Khan",
                    "email": "ahmed@example.com",
                    "created_at": "2024-01-01T00:00:00Z",
                },
            }
        }
