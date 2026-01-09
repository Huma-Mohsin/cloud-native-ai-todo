"""Authentication routes for user signup, login, and logout.

This module defines API endpoints for user authentication.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..schemas.user import SignupRequest, LoginRequest, TokenResponse
from ..services.auth_service import AuthService

# Create router
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with name, email, and password. Returns JWT token for immediate authentication."
)
async def signup(
    signup_data: SignupRequest,
    session: AsyncSession = Depends(get_session)
) -> TokenResponse:
    """Register a new user account.

    Request Body:
    - **name**: User's full name (1-100 characters)
    - **email**: Valid email address (unique)
    - **password**: Password (min 8 chars, must contain uppercase, lowercase, and digit)

    Returns:
    - **access_token**: JWT token for authentication
    - **token_type**: Token type (always "bearer")
    - **user**: User information (id, name, email, created_at)

    Raises:
    - **400 Bad Request**: Invalid email format or weak password
    - **409 Conflict**: Email already registered
    - **500 Internal Server Error**: Database error
    """
    return await AuthService.signup(signup_data, session)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login to existing account",
    description="Authenticate user with email and password. Returns JWT token."
)
async def login(
    login_data: LoginRequest,
    session: AsyncSession = Depends(get_session)
) -> TokenResponse:
    """Authenticate user and generate JWT token.

    Request Body:
    - **email**: Registered email address
    - **password**: User's password

    Returns:
    - **access_token**: JWT token for authentication
    - **token_type**: Token type (always "bearer")
    - **user**: User information (id, name, email, created_at)

    Raises:
    - **401 Unauthorized**: Invalid email or password
    """
    return await AuthService.login(login_data, session)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout current user",
    description="Logout endpoint (client-side token removal). Server does not invalidate token."
)
async def logout() -> dict:
    """Logout current user.

    Note: This is a placeholder endpoint. The actual logout logic
    happens on the client-side by removing the JWT token from storage.
    The token will expire automatically based on JWT_EXPIRATION_MINUTES.

    Returns:
    - **message**: Success message
    - **detail**: Instructions for client
    """
    return {
        "message": "Logout successful",
        "detail": "Remove the JWT token from client storage"
    }
