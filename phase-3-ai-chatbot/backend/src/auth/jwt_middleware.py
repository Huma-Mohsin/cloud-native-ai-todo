"""JWT Authentication Middleware for Better Auth integration.

This module provides JWT token verification for FastAPI endpoints.
"""

import os
from typing import Optional
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime

security = HTTPBearer()

# Get Better Auth secret from environment (REQUIRED)
BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")

if not BETTER_AUTH_SECRET:
    raise ValueError(
        "BETTER_AUTH_SECRET environment variable is required. "
        "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
    )


def verify_jwt_token(token: str) -> dict:
    """Verify JWT token and return payload.

    Args:
        token: JWT token string

    Returns:
        dict: Token payload with user information

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.now():
            raise HTTPException(
                status_code=401,
                detail="Token has expired"
            )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """Get current authenticated user from JWT token.

    Args:
        credentials: HTTP Authorization credentials

    Returns:
        dict: User information from token payload

    Raises:
        HTTPException: If token is invalid or missing
    """
    token = credentials.credentials
    payload = verify_jwt_token(token)

    user_id = payload.get("sub") or payload.get("userId")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token: missing user ID"
        )

    return {
        "id": user_id,
        "email": payload.get("email"),
        "name": payload.get("name"),
    }


def verify_user_access(user_id_from_token: str, user_id_from_path: str) -> None:
    """Verify that authenticated user matches the user_id in the URL path.

    Args:
        user_id_from_token: User ID from JWT token
        user_id_from_path: User ID from URL path parameter

    Raises:
        HTTPException: If user IDs don't match (403 Forbidden)
    """
    if user_id_from_token != user_id_from_path:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You don't have access to this resource"
        )
