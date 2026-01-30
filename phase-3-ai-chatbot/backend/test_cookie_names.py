"""Test to see what cookie names Better Auth uses"""
from fastapi import Request, Cookie
from typing import Optional

# Better Auth v1.x uses these cookie names by default:
# - better-auth.session_token (for session token)
# - better-auth.csrf_token (for CSRF)

# Let's test all possible variations
async def test_cookies(
    request: Request,
    session_token_1: Optional[str] = Cookie(None, alias="better-auth.session_token"),
    session_token_2: Optional[str] = Cookie(None, alias="better_auth_session_token"),
    session_token_3: Optional[str] = Cookie(None, alias="session_token"),
    session_token_4: Optional[str] = Cookie(None, alias="authjs.session-token"),
):
    print(f"All cookies: {request.cookies}")
    print(f"better-auth.session_token: {session_token_1}")
    print(f"better_auth_session_token: {session_token_2}")
    print(f"session_token: {session_token_3}")
    print(f"authjs.session-token: {session_token_4}")
