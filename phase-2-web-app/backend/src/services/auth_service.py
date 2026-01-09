"""Authentication service for user signup and login.

This module implements business logic for user authentication,
including signup, login, and password verification.
"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from ..models.user import User
from ..schemas.user import SignupRequest, LoginRequest, TokenResponse, UserResponse
from ..utils.security import hash_password, verify_password, create_jwt_token
from ..utils.validators import validate_email, validate_password_strength


class AuthService:
    """Authentication service for user management.

    This class handles all authentication-related business logic including
    user registration, login, and validation.
    """

    @staticmethod
    async def signup(
        signup_data: SignupRequest,
        session: AsyncSession
    ) -> TokenResponse:
        """Register a new user account.

        Steps:
        1. Validate email format and password strength
        2. Check if email already exists
        3. Hash the password
        4. Create user in database
        5. Generate JWT token
        6. Return token and user data

        Args:
            signup_data: User signup information
            session: Database session

        Returns:
            TokenResponse with JWT token and user data

        Raises:
            HTTPException 400: Invalid email or weak password
            HTTPException 409: Email already registered
            HTTPException 500: Database error
        """
        # Validate email format
        is_valid, error_msg = validate_email(signup_data.email)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        # Validate password strength
        is_valid, error_msg = validate_password_strength(signup_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        # Check if email already exists
        existing_user = await AuthService._get_user_by_email(
            signup_data.email,
            session
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = hash_password(signup_data.password)

        # Create new user
        new_user = User(
            name=signup_data.name,
            email=signup_data.email,
            password=hashed_password
        )

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        # Generate JWT token
        access_token = create_jwt_token(new_user.id, new_user.email)

        # Return token response
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user)
        )

    @staticmethod
    async def login(
        login_data: LoginRequest,
        session: AsyncSession
    ) -> TokenResponse:
        """Authenticate user and generate JWT token.

        Steps:
        1. Find user by email
        2. Verify password
        3. Generate JWT token
        4. Return token and user data

        Args:
            login_data: User login credentials
            session: Database session

        Returns:
            TokenResponse with JWT token and user data

        Raises:
            HTTPException 401: Invalid email or password
        """
        # Get user by email
        user = await AuthService._get_user_by_email(login_data.email, session)

        # Verify user exists
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(login_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Generate JWT token
        access_token = create_jwt_token(user.id, user.email)

        # Return token response
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    @staticmethod
    async def _get_user_by_email(
        email: str,
        session: AsyncSession
    ) -> Optional[User]:
        """Get user by email address.

        Args:
            email: User's email address
            session: Database session

        Returns:
            User if found, None otherwise
        """
        result = await session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(
        user_id: int,
        session: AsyncSession
    ) -> Optional[User]:
        """Get user by ID.

        Args:
            user_id: User's database ID
            session: Database session

        Returns:
            User if found, None otherwise
        """
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
