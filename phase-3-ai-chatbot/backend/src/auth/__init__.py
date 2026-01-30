"""Authentication module initialization."""

from .jwt_middleware import get_current_user, verify_user_access

__all__ = ["get_current_user", "verify_user_access"]
