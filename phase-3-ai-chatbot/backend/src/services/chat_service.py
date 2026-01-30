"""Chat service for orchestrating agent and conversation management.

Phase III: AI-Powered Chatbot - Chat Service
"""

from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from ..services.conversation_service import ConversationService
from ..services.agent_service import get_agent_service


class ChatService:
    """Service for managing chat interactions.

    This service orchestrates the full chat flow:
    1. Fetch conversation history from database
    2. Run OpenAI agent with MCP tools
    3. Store new messages in database
    4. Return agent response
    """

    def __init__(self):
        """Initialize the chat service."""
        self.agent_service = get_agent_service()

    async def process_message(
        self,
        user_id: str,
        message: str,
        conversation_id: int | None,
        language: str,
        session: AsyncSession,
    ) -> dict[str, Any]:
        """Process a user message and return agent response.

        This implements the stateless request cycle:
        1. Get or create conversation
        2. Fetch conversation history
        3. Run agent with history + new message
        4. Store user message
        5. Store agent response
        6. Return response

        Args:
            user_id: User identifier from Better Auth
            message: User's message
            conversation_id: Optional conversation ID (None for new conversation)
            language: Language preference (en or ur)
            session: Database session

        Returns:
            Dictionary with conversation_id, response, and tool_calls
        """
        # Step 1: Get or create conversation
        if conversation_id is None:
            # Create new conversation
            conversation = await ConversationService.create_conversation(
                user_id=user_id, session=session
            )
            conversation_id = conversation.id
            history = []
        else:
            # Fetch existing conversation history
            history = await ConversationService.get_conversation_history(
                conversation_id=conversation_id, user_id=user_id, session=session
            )

            if history is None:
                # Conversation not found or unauthorized
                return {
                    "success": False,
                    "error": "Conversation not found or unauthorized",
                    "conversation_id": conversation_id,
                }

        # Step 2: Store user message
        await ConversationService.add_message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="user",
            content=message,
            session=session,
        )

        # Step 3: Run agent with history + new message
        agent_result = await self.agent_service.run_agent(
            user_id=user_id,
            message=message,
            conversation_history=history,
            language=language,
            session=session,
        )

        # Step 4: Store agent response
        agent_response = agent_result.get("response", "I'm sorry, I couldn't process that.")
        await ConversationService.add_message(
            conversation_id=conversation_id,
            user_id=user_id,
            role="assistant",
            content=agent_response,
            session=session,
        )

        # Step 5: Return response
        return {
            "success": True,
            "conversation_id": conversation_id,
            "response": agent_response,
            "quick_actions": agent_result.get("quick_actions"),
            "tool_calls": agent_result.get("tool_calls", []),
        }


# Global chat service instance
_chat_service = None


def get_chat_service() -> ChatService:
    """Get the global chat service instance.

    Returns:
        ChatService instance
    """
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
