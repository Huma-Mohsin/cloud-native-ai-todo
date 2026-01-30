"""Better Auth session validation for FastAPI endpoints.

This module validates Better Auth session tokens from cookies.
"""

import os
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, Depends, Cookie
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from ..database import get_session

logger = logging.getLogger(__name__)


async def verify_session_token(
    token: str,
    session: AsyncSession
) -> dict:
    """Verify Better Auth session token and return user info.

    Args:
        token: Better Auth session token (may include signature after dot)
        session: Database session

    Returns:
        dict: User information from session

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Better Auth uses signed tokens: "token.signature"
        # Database only stores the token part (before the dot)
        token_part = token.split('.')[0] if '.' in token else token

        logger.debug(f"Validating session token: {token_part[:20]}...")

        # Query the session table (Better Auth uses 'session' table)
        query = text("""
            SELECT s.*, u.id as user_id, u.email, u.name
            FROM session s
            JOIN "user" u ON s."userId" = u.id
            WHERE s.token = :token
            AND s."expiresAt" > :now
            LIMIT 1
        """)

        result = await session.execute(
            query,
            {"token": token_part, "now": datetime.utcnow()}
        )
        row = result.fetchone()

        if not row:
            logger.warning(f"No valid session found for token: {token[:20]}...")
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired session token"
            )

        logger.info(f"Session validated for user: {row.user_id}")
        return {
            "id": row.user_id,
            "email": row.email,
            "name": row.name,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session validation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=401,
            detail=f"Session validation failed: {str(e)}"
        )


async def get_current_user(
    better_auth_session_token: Optional[str] = Cookie(None, alias="better-auth.session_token"),
    session_token: Optional[str] = Cookie(None),
    session: AsyncSession = Depends(get_session)
) -> dict:
    """Get current authenticated user from Better Auth cookie.

    Args:
        better_auth_session_token: Session token from cookie (with prefix)
        session_token: Session token from cookie (without prefix)
        session: Database session

    Returns:
        dict: User information from session

    Raises:
        HTTPException: If token is invalid or missing
    """
    # Try both cookie names (with and without prefix)
    token = better_auth_session_token or session_token

    logger.debug(f"get_current_user called, cookie: {token[:20] if token else 'None'}...")

    if not token:
        raise HTTPException(
            status_code=401,
            detail="No session token found in cookies"
        )

    return await verify_session_token(token, session)


def verify_user_access(user_id_from_token: str, user_id_from_path: str) -> None:
    """Verify that authenticated user matches the user_id in the URL path.

    Args:
        user_id_from_token: User ID from session
        user_id_from_path: User ID from URL path parameter

    Raises:
        HTTPException: If user IDs don't match (403 Forbidden)
    """
    if user_id_from_token != user_id_from_path:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You don't have access to this resource"
        )
