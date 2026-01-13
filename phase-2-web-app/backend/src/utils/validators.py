"""Input validation utilities.

This module provides functions for validating user input to ensure
data quality and security.
"""

import re


def validate_email(email: str) -> tuple[bool, str | None]:
    """Validate email address format.

    Args:
        email: Email address to validate

    Returns:
        Tuple of (is_valid, error_message)

    Example:
        >>> validate_email("ahmed@example.com")
        (True, None)
        >>> validate_email("invalid-email")
        (False, 'Invalid email format')
    """
    # Basic email regex pattern
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if not email:
        return False, "Email is required"

    if not re.match(email_pattern, email):
        return False, "Invalid email format"

    if len(email) > 255:
        return False, "Email must be less than 255 characters"

    return True, None


def validate_password_strength(password: str) -> tuple[bool, str | None]:
    """Validate password strength requirements.

    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit

    Args:
        password: Password to validate

    Returns:
        Tuple of (is_valid, error_message)

    Example:
        >>> validate_password_strength("SecurePass123")
        (True, None)
        >>> validate_password_strength("weak")
        (False, 'Password must be at least 8 characters long')
    """
    if not password:
        return False, "Password is required"

    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if len(password) > 128:
        return False, "Password must be less than 128 characters"

    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"

    return True, None


def validate_title_length(title: str) -> tuple[bool, str | None]:
    """Validate task title length.

    Requirements:
    - Minimum 1 character (non-empty)
    - Maximum 200 characters

    Args:
        title: Task title to validate

    Returns:
        Tuple of (is_valid, error_message)

    Example:
        >>> validate_title_length("Complete Phase II")
        (True, None)
        >>> validate_title_length("")
        (False, 'Title cannot be empty')
        >>> validate_title_length("x" * 201)
        (False, 'Title must be less than 200 characters')
    """
    if not title or not title.strip():
        return False, "Title cannot be empty"

    if len(title) > 200:
        return False, "Title must be less than 200 characters"

    return True, None


def validate_description_length(description: str | None) -> tuple[bool, str | None]:
    """Validate task description length.

    Requirements:
    - Optional (can be None or empty)
    - Maximum 1000 characters if provided

    Args:
        description: Task description to validate

    Returns:
        Tuple of (is_valid, error_message)

    Example:
        >>> validate_description_length(None)
        (True, None)
        >>> validate_description_length("A short description")
        (True, None)
        >>> validate_description_length("x" * 1001)
        (False, 'Description must be less than 1000 characters')
    """
    if description is None or description == "":
        return True, None

    if len(description) > 1000:
        return False, "Description must be less than 1000 characters"

    return True, None
