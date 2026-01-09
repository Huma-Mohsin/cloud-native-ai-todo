"""Authentication middleware and dependencies for protected routes.

This module provides JWT token verification middleware and FastAPI
dependencies for protecting routes that require authentication.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..utils.security import get_user_id_from_token
from ..services.auth_service import AuthService
from ..models.user import User

# HTTP Bearer security scheme for Swagger UI
security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """Extract and verify user ID from JWT token.

    This dependency can be used in route handlers to protect endpoints
    and extract the authenticated user's ID from the JWT token.

    Args:
        credentials: HTTP Authorization header with Bearer token

    Returns:
        User ID from the JWT token

    Raises:
        HTTPException 401: If token is invalid, expired, or missing

    Example:
        @app.get("/protected")
        async def protected_route(user_id: int = Depends(get_current_user_id)):
            return {"user_id": user_id}
    """
    token = credentials.credentials

    # Verify and decode token
    user_id = get_user_id_from_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id


async def get_current_user(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
) -> User:
    """Get the current authenticated user from the database.

    This dependency extends get_current_user_id to fetch the full
    user object from the database.

    Args:
        user_id: User ID from JWT token (injected by get_current_user_id)
        session: Database session

    Returns:
        Current authenticated User object

    Raises:
        HTTPException 401: If user not found in database

    Example:
        @app.get("/me")
        async def get_me(user: User = Depends(get_current_user)):
            return {"name": user.name, "email": user.email}
    """
    user = await AuthService.get_user_by_id(user_id, session)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def verify_user_id_match(
    path_user_id: int,
    current_user_id: int
) -> None:
    """Verify that the user ID in the path matches the authenticated user.

    This function is used in route handlers to ensure users can only
    access their own resources.

    Args:
        path_user_id: User ID from the URL path parameter
        current_user_id: User ID from the JWT token

    Raises:
        HTTPException 403: If user IDs don't match

    Example:
        @app.get("/api/{user_id}/tasks")
        async def get_tasks(
            user_id: int,
            current_user_id: int = Depends(get_current_user_id)
        ):
            verify_user_id_match(user_id, current_user_id)
            # User can only access their own tasks
            return get_user_tasks(user_id)
    """
    if path_user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own resources"
        )


# Optional authentication dependency (doesn't raise error if no token)
async def get_optional_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[int]:
    """Extract user ID from JWT token if present (optional authentication).

    This dependency allows endpoints to handle both authenticated and
    unauthenticated requests.

    Args:
        credentials: HTTP Authorization header (optional)

    Returns:
        User ID if token is valid, None if no token or invalid token

    Example:
        @app.get("/public")
        async def public_route(user_id: Optional[int] = Depends(get_optional_user_id)):
            if user_id:
                return {"message": f"Welcome back, user {user_id}!"}
            else:
                return {"message": "Welcome, guest!"}
    """
    if not credentials:
        return None

    user_id = get_user_id_from_token(credentials.credentials)
    return user_id
