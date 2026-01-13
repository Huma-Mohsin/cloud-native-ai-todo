"""Authentication service for user signup and login.

This module implements business logic for user authentication,
including signup, login, and password verification.
"""

import logging

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User
from ..schemas.user import LoginRequest, SignupRequest, TokenResponse, UserResponse
from ..utils.security import create_jwt_token, hash_password, verify_password
from ..utils.validators import validate_email, validate_password_strength

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


class AuthService:
    """Authentication service for user management.

    This class handles all authentication-related business logic including
    user registration, login, and validation.
    """

    @staticmethod
    async def signup(
        signup_data: SignupRequest, session: AsyncSession
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
        try:
            logger.debug(f"[SIGNUP] Starting signup for email: {signup_data.email}")

            # Validate email format
            logger.debug("[SIGNUP] Validating email format")
            is_valid, error_msg = validate_email(signup_data.email)
            if not is_valid:
                logger.warning(f"[SIGNUP] Invalid email: {error_msg}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg
                )

            # Validate password strength
            logger.debug("[SIGNUP] Validating password strength")
            is_valid, error_msg = validate_password_strength(signup_data.password)
            if not is_valid:
                logger.warning(f"[SIGNUP] Weak password: {error_msg}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg
                )

            # Check if email already exists
            logger.debug("[SIGNUP] Checking if email exists")
            existing_user = await AuthService._get_user_by_email(
                signup_data.email, session
            )
            if existing_user:
                logger.warning(f"[SIGNUP] Email already exists: {signup_data.email}")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered",
                )

            # Hash password
            logger.debug("[SIGNUP] Hashing password")
            hashed_password = hash_password(signup_data.password)

            # Create new user
            logger.debug("[SIGNUP] Creating user in database")
            new_user = User(
                name=signup_data.name, email=signup_data.email, password=hashed_password
            )

            session.add(new_user)
            logger.debug("[SIGNUP] Committing to database")
            await session.commit()
            logger.debug("[SIGNUP] Refreshing user object")
            await session.refresh(new_user)

            # Generate JWT token
            logger.debug(f"[SIGNUP] Generating JWT token for user_id: {new_user.id}")
            access_token = create_jwt_token(new_user.id, new_user.email)

            # Return token response
            logger.info(f"[SIGNUP] Successfully created user: {signup_data.email}")
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse.model_validate(new_user),
            )

        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except Exception as e:
            # Log and re-raise any other exceptions
            logger.error(
                f"[SIGNUP] Unexpected error during signup: {e!s}", exc_info=True
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Internal server error: {e!s}",
            )

    @staticmethod
    async def login(login_data: LoginRequest, session: AsyncSession) -> TokenResponse:
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
                detail="Invalid email or password",
            )

        # Verify password
        if not verify_password(login_data.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Generate JWT token
        access_token = create_jwt_token(user.id, user.email)

        # Return token response
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    async def _get_user_by_email(email: str, session: AsyncSession) -> User | None:
        """Get user by email address.

        Args:
            email: User's email address
            session: Database session

        Returns:
            User if found, None otherwise
        """
        result = await session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(user_id: int, session: AsyncSession) -> User | None:
        """Get user by ID.

        Args:
            user_id: User's database ID
            session: Database session

        Returns:
            User if found, None otherwise
        """
        result = await session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
