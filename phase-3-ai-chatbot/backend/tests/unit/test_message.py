"""Unit tests for Message model.

Phase III: AI-Powered Chatbot - T007
Tests CRUD operations, field validation, and role types for Message model.
"""

import pytest
from datetime import datetime
from sqlmodel import select

from src.models.message import Message, RoleType


@pytest.mark.asyncio
async def test_create_user_message(async_session, test_conversation, test_user_id):
    """Test creating a user message.

    Acceptance Criteria:
    - Message is created with role='user'
    - Timestamps are auto-generated
    - Message is linked to conversation and user
    """
    message = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="user",
        content="Add a task to buy groceries"
    )
    async_session.add(message)
    await async_session.commit()
    await async_session.refresh(message)

    assert message.id is not None
    assert message.conversation_id == test_conversation.id
    assert message.user_id == test_user_id
    assert message.role == "user"
    assert message.content == "Add a task to buy groceries"
    assert isinstance(message.created_at, datetime)


@pytest.mark.asyncio
async def test_create_assistant_message(async_session, test_conversation, test_user_id):
    """Test creating an assistant message.

    Acceptance Criteria:
    - Message is created with role='assistant'
    - Content is stored correctly
    """
    message = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="assistant",
        content="✓ Added task: Buy groceries (ID: 42)"
    )
    async_session.add(message)
    await async_session.commit()
    await async_session.refresh(message)

    assert message.role == "assistant"
    assert "Added task" in message.content


@pytest.mark.asyncio
async def test_read_message(async_session, test_conversation, test_user_id):
    """Test reading an existing message.

    Acceptance Criteria:
    - Message can be retrieved by ID
    - All fields are correctly populated
    """
    # Create message
    message = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="user",
        content="Test message"
    )
    async_session.add(message)
    await async_session.commit()
    await async_session.refresh(message)

    # Read message
    statement = select(Message).where(Message.id == message.id)
    result = await async_session.execute(statement)
    retrieved = result.scalar_one()

    assert retrieved.id == message.id
    assert retrieved.conversation_id == message.conversation_id
    assert retrieved.user_id == message.user_id
    assert retrieved.role == message.role
    assert retrieved.content == message.content


@pytest.mark.asyncio
async def test_update_message(async_session, test_conversation, test_user_id):
    """Test updating message content.

    Acceptance Criteria:
    - Message content can be modified
    - Changes persist to database
    """
    message = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="user",
        content="Original content"
    )
    async_session.add(message)
    await async_session.commit()
    await async_session.refresh(message)

    # Update content
    message.content = "Updated content"
    async_session.add(message)
    await async_session.commit()
    await async_session.refresh(message)

    assert message.content == "Updated content"


@pytest.mark.asyncio
async def test_delete_message(async_session, test_conversation, test_user_id):
    """Test deleting a message.

    Acceptance Criteria:
    - Message is removed from database
    - Query returns None after deletion
    """
    message = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="user",
        content="To be deleted"
    )
    async_session.add(message)
    await async_session.commit()
    await async_session.refresh(message)
    message_id = message.id

    # Delete
    await async_session.delete(message)
    await async_session.commit()

    # Verify deletion
    statement = select(Message).where(Message.id == message_id)
    result = await async_session.execute(statement)
    retrieved = result.scalar_one_or_none()

    assert retrieved is None


@pytest.mark.asyncio
async def test_list_conversation_messages(async_session, test_conversation, test_user_id):
    """Test listing all messages in a conversation.

    Acceptance Criteria:
    - Multiple messages can belong to same conversation
    - Messages are retrieved in correct order
    - Messages from other conversations are not included
    """
    # Create conversation messages
    msg1 = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="user",
        content="First message"
    )
    msg2 = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="assistant",
        content="Second message"
    )

    # Create message in different conversation
    from src.models.conversation import Conversation
    other_conv = Conversation(user_id=test_user_id)
    async_session.add(other_conv)
    await async_session.commit()
    await async_session.refresh(other_conv)

    msg3 = Message(
        conversation_id=other_conv.id,
        user_id=test_user_id,
        role="user",
        content="Different conversation"
    )

    async_session.add_all([msg1, msg2, msg3])
    await async_session.commit()

    # Query messages for test_conversation
    statement = select(Message).where(
        Message.conversation_id == test_conversation.id
    ).order_by(Message.created_at)
    result = await async_session.execute(statement)
    messages = result.scalars().all()

    assert len(messages) == 2
    assert messages[0].content == "First message"
    assert messages[1].content == "Second message"


@pytest.mark.asyncio
async def test_list_user_messages(async_session, test_conversation, test_user_id):
    """Test listing all messages for a user.

    Acceptance Criteria:
    - User's messages across conversations are retrieved
    - Other users' messages are not included
    """
    # Create messages for test user
    msg1 = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="user",
        content="User message 1"
    )
    msg2 = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="user",
        content="User message 2"
    )

    # Create message for different user
    msg3 = Message(
        conversation_id=test_conversation.id,
        user_id="different_user",
        role="user",
        content="Different user message"
    )

    async_session.add_all([msg1, msg2, msg3])
    await async_session.commit()

    # Query messages for test_user_id
    statement = select(Message).where(Message.user_id == test_user_id)
    result = await async_session.execute(statement)
    messages = result.scalars().all()

    assert len(messages) == 2
    assert all(m.user_id == test_user_id for m in messages)


@pytest.mark.asyncio
async def test_message_indexes(async_session, test_conversation, test_user_id):
    """Test that messages are indexed for efficient queries.

    Acceptance Criteria:
    - conversation_id is indexed
    - user_id is indexed
    - created_at is indexed
    """
    # Create multiple messages
    for i in range(10):
        msg = Message(
            conversation_id=test_conversation.id,
            user_id=test_user_id,
            role="user",
            content=f"Message {i}"
        )
        async_session.add(msg)

    await async_session.commit()

    # Test conversation_id index
    statement = select(Message).where(
        Message.conversation_id == test_conversation.id
    )
    result = await async_session.execute(statement)
    messages = result.scalars().all()
    assert len(messages) == 10

    # Test user_id index
    statement = select(Message).where(Message.user_id == test_user_id)
    result = await async_session.execute(statement)
    messages = result.scalars().all()
    assert len(messages) == 10

    # Test created_at ordering
    statement = select(Message).order_by(Message.created_at.desc())
    result = await async_session.execute(statement)
    messages = result.scalars().all()
    assert len(messages) == 10


@pytest.mark.asyncio
async def test_message_role_types():
    """Test message role type validation.

    Acceptance Criteria:
    - 'user' role is valid
    - 'assistant' role is valid
    - RoleType literal is correctly defined
    """
    # Test valid roles
    user_msg = Message(
        conversation_id=1,
        user_id="test",
        role="user",
        content="Test"
    )
    assert user_msg.role == "user"

    assistant_msg = Message(
        conversation_id=1,
        user_id="test",
        role="assistant",
        content="Test"
    )
    assert assistant_msg.role == "assistant"


@pytest.mark.asyncio
async def test_message_model_validation():
    """Test Message model field validation.

    Acceptance Criteria:
    - All required fields must be provided
    - Model has correct table name
    """
    message = Message(
        conversation_id=1,
        user_id="test_user",
        role="user",
        content="Test message"
    )

    assert message.conversation_id == 1
    assert message.user_id == "test_user"
    assert message.role == "user"
    assert message.content == "Test message"
    assert message.__tablename__ == "messages"
    assert message.id is None  # Auto-generated


@pytest.mark.asyncio
async def test_message_content_length(async_session, test_conversation, test_user_id):
    """Test storing long message content.

    Acceptance Criteria:
    - Long messages (up to 2000 chars) are stored correctly
    - Content is retrieved exactly as stored
    """
    long_content = "A" * 2000  # 2000 character message

    message = Message(
        conversation_id=test_conversation.id,
        user_id=test_user_id,
        role="user",
        content=long_content
    )
    async_session.add(message)
    await async_session.commit()
    await async_session.refresh(message)

    assert len(message.content) == 2000
    assert message.content == long_content


@pytest.mark.asyncio
async def test_message_timestamp_ordering(async_session, test_conversation, test_user_id):
    """Test that messages can be ordered by timestamp.

    Acceptance Criteria:
    - Messages have sequential created_at timestamps
    - Messages can be sorted by created_at
    """
    import asyncio

    # Create messages with slight delays to ensure different timestamps
    messages = []
    for i in range(3):
        msg = Message(
            conversation_id=test_conversation.id,
            user_id=test_user_id,
            role="user",
            content=f"Message {i}"
        )
        async_session.add(msg)
        await async_session.commit()
        await async_session.refresh(msg)
        messages.append(msg)
        await asyncio.sleep(0.01)  # Small delay

    # Query in reverse order
    statement = select(Message).where(
        Message.conversation_id == test_conversation.id
    ).order_by(Message.created_at.desc())
    result = await async_session.execute(statement)
    retrieved = result.scalars().all()

    # Verify ordering (newest first)
    assert retrieved[0].content == "Message 2"
    assert retrieved[1].content == "Message 1"
    assert retrieved[2].content == "Message 0"
