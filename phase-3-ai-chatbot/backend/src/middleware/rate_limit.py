"""Rate limiting middleware for API endpoints.

This module provides rate limiting functionality to prevent abuse.
"""

import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse


# Get rate limit from environment or use default
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom handler for rate limit exceeded errors.

    Args:
        request: The FastAPI request
        exc: The rate limit exceeded exception

    Returns:
        JSONResponse with 429 status code
    """
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "detail": f"Too many requests. Please try again in a minute.",
        },
    )


# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{RATE_LIMIT_PER_MINUTE}/minute"],
    storage_uri="memory://",
)
