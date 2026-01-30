"""Chat API routes for Phase III AI-Powered Chatbot.

This module provides the chat endpoint for natural language task management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from ...database import get_session
from ...services.chat_service import get_chat_service
from ...auth.better_auth import get_current_user, verify_user_access
from ...middleware.rate_limit import limiter
from ...utils.sanitize import sanitize_chat_message
from ...utils.logger import log_error, log_info, log_warning


router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""

    conversation_id: int | None = Field(None, description="Optional conversation ID for continuing a conversation")
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    language: str | None = Field("en", description="Language preference (en or ur)")

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": None,
                "message": "Add a task to buy groceries",
                "language": "en"
            }
        }


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""

    success: bool = Field(..., description="Whether the request succeeded")
    conversation_id: int = Field(..., description="Conversation ID")
    response: str = Field(..., description="Agent's response")
    quick_actions: dict | None = Field(None, description="Quick action buttons for interactive UI")
    tool_calls: list[dict] = Field(default_factory=list, description="Tools called by the agent")
    error: str | None = Field(None, description="Error message if failed")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "conversation_id": 1,
                "response": "I've added the task 'Buy groceries' for you (ID: 42)",
                "quick_actions": None,
                "tool_calls": [{"tool": "add_task", "result": "success"}],
                "error": None
            }
        }


@router.post("/{user_id}/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def chat(
    request: Request,
    user_id: str,
    chat_request: ChatRequest,
    session: AsyncSession = Depends(get_session),
    current_user: dict = Depends(get_current_user),
) -> ChatResponse:
    """Process a chat message and return agent response.

    This endpoint implements the stateless chat architecture:
    1. Verifies JWT token and user authorization
    2. Fetches conversation history from database
    3. Runs OpenAI agent with MCP tools
    4. Stores messages in database
    5. Returns agent response

    Args:
        user_id: User identifier from Better Auth (path parameter)
        request: Chat request with message and optional conversation_id
        session: Database session (injected)
        current_user: Authenticated user from JWT token (injected)

    Returns:
        ChatResponse with conversation_id, agent response, and tool calls

    Raises:
        HTTPException: If authentication fails or chat processing fails
    """
    # Verify user has access to this resource
    verify_user_access(current_user["id"], user_id)

    # Log incoming request
    log_info(
        f"Chat request received",
        context={
            "user_id": user_id,
            "conversation_id": chat_request.conversation_id,
            "message_length": len(chat_request.message),
        }
    )

    # Sanitize user input
    try:
        sanitized_message = sanitize_chat_message(chat_request.message)
    except ValueError as e:
        log_warning(
            f"Invalid input rejected: {str(e)}",
            context={"user_id": user_id}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input: {str(e)}",
        )

    try:
        chat_service = get_chat_service()

        result = await chat_service.process_message(
            user_id=user_id,
            message=sanitized_message,
            conversation_id=chat_request.conversation_id,
            language=chat_request.language or "en",
            session=session,
        )

        if not result.get("success", False):
            log_warning(
                f"Chat processing failed: {result.get('error')}",
                context={"user_id": user_id, "conversation_id": chat_request.conversation_id}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to process message"),
            )

        log_info(
            f"Chat request processed successfully",
            context={
                "user_id": user_id,
                "conversation_id": result["conversation_id"],
                "tools_called": len(result.get("tool_calls", [])),
            }
        )

        return ChatResponse(
            success=True,
            conversation_id=result["conversation_id"],
            response=result["response"],
            quick_actions=result.get("quick_actions"),
            tool_calls=result.get("tool_calls", []),
            error=None,
        )

    except HTTPException:
        raise
    except Exception as e:
        log_error(
            e,
            context={
                "user_id": user_id,
                "conversation_id": chat_request.conversation_id,
                "endpoint": "chat",
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )
