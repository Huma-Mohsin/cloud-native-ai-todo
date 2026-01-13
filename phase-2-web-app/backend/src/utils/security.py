"""Security utilities for password hashing and JWT token management.

This module provides functions for securely hashing passwords using bcrypt
and creating/verifying JWT tokens for authentication.
"""

from datetime import datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from ..config import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt.

    Args:
        password: Plaintext password to hash

    Returns:
        Bcrypt hash of the password

    Example:
        >>> hashed = hash_password("SecurePass123!")
        >>> hashed.startswith("$2b$")
        True
    """
    # Encode password to bytes
    password_bytes = password.encode("utf-8")
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hashed password.

    Args:
        plain_password: Plaintext password to verify
        hashed_password: Bcrypt hash to compare against

    Returns:
        True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("SecurePass123!")
        >>> verify_password("SecurePass123!", hashed)
        True
        >>> verify_password("WrongPassword", hashed)
        False
    """
    # Encode password and hash to bytes
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    # Verify
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_jwt_token(user_id: int, email: str) -> str:
    """Create a JWT access token for a user.

    Args:
        user_id: User's database ID
        email: User's email address

    Returns:
        Encoded JWT token string

    Example:
        >>> token = create_jwt_token(1, "ahmed@example.com")
        >>> isinstance(token, str)
        True
        >>> len(token) > 50
        True
    """
    expires_at = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)

    payload: dict[str, Any] = {
        "sub": str(user_id),  # Subject (user ID)
        "email": email,
        "exp": expires_at,  # Expiration time
        "iat": datetime.utcnow(),  # Issued at
    }

    token = jwt.encode(
        payload, settings.BETTER_AUTH_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    return token


def verify_jwt_token(token: str) -> dict[str, Any] | None:
    """Verify and decode a JWT token.

    Args:
        token: JWT token string to verify

    Returns:
        Decoded token payload if valid, None if invalid

    Example:
        >>> token = create_jwt_token(1, "ahmed@example.com")
        >>> payload = verify_jwt_token(token)
        >>> payload is not None
        True
        >>> payload["sub"]
        '1'
        >>> verify_jwt_token("invalid.token.here") is None
        True
    """
    try:
        payload = jwt.decode(
            token, settings.BETTER_AUTH_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def get_user_id_from_token(token: str) -> int | None:
    """Extract user ID from a JWT token.

    Args:
        token: JWT token string

    Returns:
        User ID if token is valid, None otherwise

    Example:
        >>> token = create_jwt_token(42, "user@example.com")
        >>> get_user_id_from_token(token)
        42
        >>> get_user_id_from_token("invalid") is None
        True
    """
    payload = verify_jwt_token(token)
    if payload is None:
        return None

    try:
        user_id = int(payload.get("sub", ""))
        return user_id
    except (ValueError, TypeError):
        return None
