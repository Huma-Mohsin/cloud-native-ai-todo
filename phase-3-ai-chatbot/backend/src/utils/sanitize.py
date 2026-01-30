"""Input sanitization utilities for security.

This module provides functions to sanitize user input and prevent
XSS, SQL injection, and other security vulnerabilities.
"""

import re
import bleach


def sanitize_text(text: str, max_length: int = 2000) -> str:
    """Sanitize text input to prevent XSS and injection attacks.

    Args:
        text: Raw text input from user
        max_length: Maximum allowed length (default: 2000)

    Returns:
        Sanitized text safe for storage and display

    Raises:
        ValueError: If text exceeds max_length or contains malicious content
    """
    if not text or not isinstance(text, str):
        raise ValueError("Input must be a non-empty string")

    # Remove leading/trailing whitespace
    text = text.strip()

    # Check length
    if len(text) > max_length:
        raise ValueError(f"Input exceeds maximum length of {max_length} characters")

    # Sanitize HTML tags and attributes
    # bleach.clean removes all HTML tags by default
    sanitized = bleach.clean(
        text,
        tags=[],  # No HTML tags allowed
        attributes={},  # No attributes allowed
        strip=True,  # Strip disallowed tags instead of escaping
    )

    # Remove null bytes (can cause issues with PostgreSQL)
    sanitized = sanitized.replace("\x00", "")

    # Check for SQL injection patterns (basic check)
    sql_patterns = [
        r"(\bUNION\b.*\bSELECT\b)",
        r"(\bDROP\b.*\bTABLE\b)",
        r"(\bINSERT\b.*\bINTO\b.*\bVALUES\b)",
        r"(\bDELETE\b.*\bFROM\b)",
        r"(\bUPDATE\b.*\bSET\b)",
        r"(--|\#|\/\*|\*\/)",  # SQL comments
    ]

    for pattern in sql_patterns:
        if re.search(pattern, sanitized, re.IGNORECASE):
            raise ValueError("Input contains potentially malicious content")

    # Check for script injection patterns
    script_patterns = [
        r"<script",
        r"javascript:",
        r"onerror=",
        r"onclick=",
        r"onload=",
    ]

    for pattern in script_patterns:
        if re.search(pattern, sanitized, re.IGNORECASE):
            raise ValueError("Input contains potentially malicious content")

    return sanitized


def sanitize_task_title(title: str) -> str:
    """Sanitize task title input.

    Args:
        title: Raw task title from user

    Returns:
        Sanitized title (max 200 chars)

    Raises:
        ValueError: If title is invalid
    """
    return sanitize_text(title, max_length=200)


def sanitize_task_description(description: str | None) -> str | None:
    """Sanitize task description input.

    Args:
        description: Raw task description from user (can be None)

    Returns:
        Sanitized description (max 1000 chars) or None

    Raises:
        ValueError: If description is invalid
    """
    if description is None or description.strip() == "":
        return None

    return sanitize_text(description, max_length=1000)


def sanitize_chat_message(message: str) -> str:
    """Sanitize chat message input.

    Args:
        message: Raw chat message from user

    Returns:
        Sanitized message (max 2000 chars)

    Raises:
        ValueError: If message is invalid
    """
    return sanitize_text(message, max_length=2000)
