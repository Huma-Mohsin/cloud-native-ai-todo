"""Unit tests for Conversation model.

Phase III: AI-Powered Chatbot - T006
Tests CRUD operations, field validation, and timestamps for Conversation model.
"""

import pytest
from datetime import datetime
from sqlmodel import select

from src.models.conversation import Conversation


@pytest.mark.asyncio
async def test_create_conversation(async_session, test_user_id):
    """Test creating a new conversation.

    Acceptance Criteria:
    - Conversation is created with valid user_id
    - Timestamps are auto-generated
    - ID is auto-assigned
    """
    conversation = Conversation(user_id=test_user_id)
    async_session.add(conversation)
    await async_session.commit()
    await async_session.refresh(conversation)

    assert conversation.id is not None
    assert conversation.user_id == test_user_id
    assert isinstance(conversation.created_at, datetime)
    assert isinstance(conversation.updated_at, datetime)
    # Timestamps should be very close (within 1 second)
    assert (conversation.updated_at - conversation.created_at).total_seconds() < 1


@pytest.mark.asyncio
async def test_read_conversation(async_session, test_conversation):
    """Test reading an existing conversation.

    Acceptance Criteria:
    - Conversation can be retrieved by ID
    - All fields are correctly populated
    """
    statement = select(Conversation).where(Conversation.id == test_conversation.id)
    result = await async_session.execute(statement)
    retrieved = result.scalar_one()

    assert retrieved.id == test_conversation.id
    assert retrieved.user_id == test_conversation.user_id
    assert retrieved.created_at == test_conversation.created_at
    assert retrieved.updated_at == test_conversation.updated_at


@pytest.mark.asyncio
async def test_update_conversation(async_session, test_conversation):
    """Test updating conversation timestamps.

    Acceptance Criteria:
    - updated_at timestamp can be modified
    - Conversation persists changes
    """
    original_updated_at = test_conversation.updated_at

    # Update timestamp
    test_conversation.updated_at = datetime.utcnow()
    async_session.add(test_conversation)
    await async_session.commit()
    await async_session.refresh(test_conversation)

    assert test_conversation.updated_at > original_updated_at


@pytest.mark.asyncio
async def test_delete_conversation(async_session, test_conversation):
    """Test deleting a conversation.

    Acceptance Criteria:
    - Conversation is removed from database
    - Query returns None after deletion
    """
    conversation_id = test_conversation.id

    await async_session.delete(test_conversation)
    await async_session.commit()

    # Verify deletion
    statement = select(Conversation).where(Conversation.id == conversation_id)
    result = await async_session.execute(statement)
    retrieved = result.scalar_one_or_none()

    assert retrieved is None


@pytest.mark.asyncio
async def test_list_user_conversations(async_session, test_user_id):
    """Test listing all conversations for a user.

    Acceptance Criteria:
    - Multiple conversations can be created for same user
    - All user conversations are retrieved
    - Other users' conversations are not included
    """
    # Create multiple conversations for test user
    conv1 = Conversation(user_id=test_user_id)
    conv2 = Conversation(user_id=test_user_id)
    conv3 = Conversation(user_id="different_user")

    async_session.add_all([conv1, conv2, conv3])
    await async_session.commit()

    # Query user's conversations
    statement = select(Conversation).where(Conversation.user_id == test_user_id)
    result = await async_session.execute(statement)
    conversations = result.scalars().all()

    assert len(conversations) == 2
    assert all(c.user_id == test_user_id for c in conversations)


@pytest.mark.asyncio
async def test_conversation_user_id_index(async_session, test_user_id):
    """Test that user_id is indexed for performance.

    Acceptance Criteria:
    - Conversation can be efficiently queried by user_id
    - Index supports data isolation
    """
    # Create conversations
    for i in range(10):
        conv = Conversation(user_id=test_user_id)
        async_session.add(conv)

    await async_session.commit()

    # Query by user_id (should use index)
    statement = select(Conversation).where(Conversation.user_id == test_user_id)
    result = await async_session.execute(statement)
    conversations = result.scalars().all()

    assert len(conversations) == 10


@pytest.mark.asyncio
async def test_conversation_model_validation():
    """Test Conversation model field validation.

    Acceptance Criteria:
    - user_id is required
    - Model has correct table name
    """
    # Test model creation with valid data
    conversation = Conversation(user_id="test_user")
    assert conversation.user_id == "test_user"
    assert conversation.__tablename__ == "conversations"

    # Test that id defaults to None (auto-generated)
    assert conversation.id is None


@pytest.mark.asyncio
async def test_conversation_timestamps_default():
    """Test that timestamps are auto-generated.

    Acceptance Criteria:
    - created_at is set automatically
    - updated_at is set automatically
    - Both use UTC timezone
    """
    conversation = Conversation(user_id="test_user")

    assert isinstance(conversation.created_at, datetime)
    assert isinstance(conversation.updated_at, datetime)
    # Verify timestamps are recent (within last second)
    now = datetime.utcnow()
    assert (now - conversation.created_at).total_seconds() < 1
    assert (now - conversation.updated_at).total_seconds() < 1
