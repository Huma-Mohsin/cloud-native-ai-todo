"""Conversation service for business logic operations.

This module provides the ConversationService class for managing conversation
and message CRUD operations for Phase III AI-Powered Chatbot.
"""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.conversation import Conversation
from ..models.message import Message


class ConversationService:
    """Service class for conversation and message operations.

    This class encapsulates all conversation-related business logic and database
    operations, keeping route handlers clean and focused.
    """

    @staticmethod
    async def create_conversation(
        user_id: str, session: AsyncSession
    ) -> Conversation:
        """Create a new conversation for a user.

        Args:
            user_id: User identifier from Better Auth
            session: Database session

        Returns:
            Created Conversation object
        """
        conversation = Conversation(
            user_id=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)

        return conversation

    @staticmethod
    async def get_conversation_by_id(
        conversation_id: int, session: AsyncSession
    ) -> Conversation | None:
        """Get a conversation by its ID.

        Args:
            conversation_id: ID of the conversation
            session: Database session

        Returns:
            Conversation object if found, None otherwise
        """
        statement = select(Conversation).where(Conversation.id == conversation_id)
        result = await session.execute(statement)
        conversation = result.scalar_one_or_none()

        return conversation

    @staticmethod
    async def get_user_conversations(
        user_id: str, session: AsyncSession, limit: int = 50
    ) -> list[Conversation]:
        """Get all conversations for a user, ordered by most recent.

        Args:
            user_id: User identifier from Better Auth
            session: Database session
            limit: Maximum number of conversations to return (default: 50)

        Returns:
            List of Conversation objects
        """
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )

        result = await session.execute(statement)
        conversations = result.scalars().all()

        return list(conversations)

    @staticmethod
    async def delete_conversation(
        conversation_id: int, user_id: str, session: AsyncSession
    ) -> bool:
        """Delete a conversation and all its messages (CASCADE).

        Args:
            conversation_id: ID of the conversation to delete
            user_id: User identifier (for authorization)
            session: Database session

        Returns:
            True if conversation was deleted, False if not found or unauthorized
        """
        # Get the conversation
        conversation = await ConversationService.get_conversation_by_id(
            conversation_id, session
        )

        if not conversation or conversation.user_id != user_id:
            return False

        await session.delete(conversation)
        await session.commit()

        return True

    @staticmethod
    async def add_message(
        conversation_id: int,
        user_id: str,
        role: str,
        content: str,
        session: AsyncSession,
    ) -> Message:
        """Add a message to a conversation.

        Args:
            conversation_id: ID of the conversation
            user_id: User identifier from Better Auth
            role: Message role ('user' or 'assistant')
            content: Message text content
            session: Database session

        Returns:
            Created Message object

        Note:
            The database trigger will automatically update conversation.updated_at
        """
        message = Message(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
            content=content,
            created_at=datetime.utcnow(),
        )

        session.add(message)
        await session.commit()
        await session.refresh(message)

        return message

    @staticmethod
    async def get_conversation_messages(
        conversation_id: int, session: AsyncSession, limit: int = 100
    ) -> list[Message]:
        """Get all messages for a conversation, ordered chronologically.

        Args:
            conversation_id: ID of the conversation
            session: Database session
            limit: Maximum number of messages to return (default: 100)

        Returns:
            List of Message objects ordered by created_at ascending
        """
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )

        result = await session.execute(statement)
        messages = result.scalars().all()

        return list(messages)

    @staticmethod
    async def get_conversation_history(
        conversation_id: int, user_id: str, session: AsyncSession
    ) -> list[dict] | None:
        """Get conversation history formatted for OpenAI API.

        Args:
            conversation_id: ID of the conversation
            user_id: User identifier (for authorization)
            session: Database session

        Returns:
            List of message dicts with 'role' and 'content' keys,
            or None if conversation not found or unauthorized
        """
        # Verify conversation exists and belongs to user
        conversation = await ConversationService.get_conversation_by_id(
            conversation_id, session
        )

        if not conversation or conversation.user_id != user_id:
            return None

        # Get messages
        messages = await ConversationService.get_conversation_messages(
            conversation_id, session
        )

        # Format for OpenAI API
        history = [{"role": msg.role, "content": msg.content} for msg in messages]

        return history
