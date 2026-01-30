"""Integration tests for conversation CRUD operations.

Phase III: AI-Powered Chatbot - T010
Tests ConversationService with real database operations.
"""

import pytest

from src.services.conversation_service import ConversationService


@pytest.mark.asyncio
async def test_create_conversation_integration(async_session, test_user_id):
    """Test creating a conversation through the service.

    Acceptance Criteria:
    - Conversation is created in database
    - ID is auto-generated
    - Timestamps are set
    - User ID is stored correctly
    """
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    assert conversation.id is not None
    assert conversation.user_id == test_user_id
    assert conversation.created_at is not None
    assert conversation.updated_at is not None


@pytest.mark.asyncio
async def test_get_conversation_by_id_integration(async_session, test_user_id):
    """Test retrieving a conversation by ID.

    Acceptance Criteria:
    - Conversation can be retrieved by ID
    - Correct conversation is returned
    - Returns None if not found
    """
    # Create conversation
    created = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Retrieve conversation
    retrieved = await ConversationService.get_conversation_by_id(
        conversation_id=created.id, session=async_session
    )

    assert retrieved is not None
    assert retrieved.id == created.id
    assert retrieved.user_id == test_user_id

    # Test non-existent ID
    not_found = await ConversationService.get_conversation_by_id(
        conversation_id=99999, session=async_session
    )
    assert not_found is None


@pytest.mark.asyncio
async def test_get_user_conversations_integration(async_session, test_user_id):
    """Test retrieving all conversations for a user.

    Acceptance Criteria:
    - All user conversations are returned
    - Conversations are ordered by updated_at descending
    - Other users' conversations are not included
    - Limit parameter works correctly
    """
    # Create multiple conversations for test user
    conv1 = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )
    conv2 = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Create conversation for different user
    await ConversationService.create_conversation(
        user_id="different_user", session=async_session
    )

    # Retrieve user conversations
    conversations = await ConversationService.get_user_conversations(
        user_id=test_user_id, session=async_session
    )

    assert len(conversations) == 2
    assert all(c.user_id == test_user_id for c in conversations)
    # Verify ordering (most recent first)
    assert conversations[0].id >= conversations[1].id


@pytest.mark.asyncio
async def test_get_user_conversations_with_limit(async_session, test_user_id):
    """Test limit parameter for user conversations.

    Acceptance Criteria:
    - Only requested number of conversations returned
    - Most recent conversations are prioritized
    """
    # Create 5 conversations
    for _ in range(5):
        await ConversationService.create_conversation(
            user_id=test_user_id, session=async_session
        )

    # Get with limit=3
    conversations = await ConversationService.get_user_conversations(
        user_id=test_user_id, session=async_session, limit=3
    )

    assert len(conversations) == 3


@pytest.mark.asyncio
async def test_delete_conversation_integration(async_session, test_user_id):
    """Test deleting a conversation.

    Acceptance Criteria:
    - Conversation is deleted from database
    - Returns True on successful deletion
    - Returns False if not found
    - Returns False if user_id doesn't match (authorization)
    """
    # Create conversation
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )
    conversation_id = conversation.id

    # Delete conversation
    result = await ConversationService.delete_conversation(
        conversation_id=conversation_id, user_id=test_user_id, session=async_session
    )

    assert result is True

    # Verify deletion
    retrieved = await ConversationService.get_conversation_by_id(
        conversation_id=conversation_id, session=async_session
    )
    assert retrieved is None


@pytest.mark.asyncio
async def test_delete_conversation_unauthorized(async_session, test_user_id):
    """Test deleting conversation with wrong user_id.

    Acceptance Criteria:
    - Deletion fails if user_id doesn't match
    - Conversation remains in database
    """
    # Create conversation
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Attempt to delete with different user_id
    result = await ConversationService.delete_conversation(
        conversation_id=conversation.id,
        user_id="different_user",
        session=async_session,
    )

    assert result is False

    # Verify conversation still exists
    retrieved = await ConversationService.get_conversation_by_id(
        conversation_id=conversation.id, session=async_session
    )
    assert retrieved is not None


@pytest.mark.asyncio
async def test_delete_nonexistent_conversation(async_session, test_user_id):
    """Test deleting a conversation that doesn't exist.

    Acceptance Criteria:
    - Returns False for non-existent conversation
    - No errors are raised
    """
    result = await ConversationService.delete_conversation(
        conversation_id=99999, user_id=test_user_id, session=async_session
    )

    assert result is False


@pytest.mark.asyncio
async def test_add_message_integration(async_session, test_user_id):
    """Test adding a message to a conversation.

    Acceptance Criteria:
    - Message is created in database
    - Message is linked to conversation
    - Role and content are stored correctly
    """
    # Create conversation
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Add user message
    message = await ConversationService.add_message(
        conversation_id=conversation.id,
        user_id=test_user_id,
        role="user",
        content="Test message",
        session=async_session,
    )

    assert message.id is not None
    assert message.conversation_id == conversation.id
    assert message.user_id == test_user_id
    assert message.role == "user"
    assert message.content == "Test message"


@pytest.mark.asyncio
async def test_add_multiple_messages_integration(async_session, test_user_id):
    """Test adding multiple messages to a conversation.

    Acceptance Criteria:
    - Multiple messages can be added
    - Messages maintain chronological order
    """
    # Create conversation
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Add multiple messages
    msg1 = await ConversationService.add_message(
        conversation_id=conversation.id,
        user_id=test_user_id,
        role="user",
        content="First message",
        session=async_session,
    )

    msg2 = await ConversationService.add_message(
        conversation_id=conversation.id,
        user_id=test_user_id,
        role="assistant",
        content="Second message",
        session=async_session,
    )

    assert msg1.id < msg2.id
    assert msg1.created_at <= msg2.created_at


@pytest.mark.asyncio
async def test_get_conversation_messages_integration(async_session, test_user_id):
    """Test retrieving all messages for a conversation.

    Acceptance Criteria:
    - All messages are returned
    - Messages are ordered chronologically (oldest first)
    - Only messages for the conversation are included
    """
    # Create two conversations
    conv1 = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )
    conv2 = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Add messages to conv1
    await ConversationService.add_message(
        conversation_id=conv1.id,
        user_id=test_user_id,
        role="user",
        content="Conv1 Message 1",
        session=async_session,
    )
    await ConversationService.add_message(
        conversation_id=conv1.id,
        user_id=test_user_id,
        role="assistant",
        content="Conv1 Message 2",
        session=async_session,
    )

    # Add message to conv2
    await ConversationService.add_message(
        conversation_id=conv2.id,
        user_id=test_user_id,
        role="user",
        content="Conv2 Message 1",
        session=async_session,
    )

    # Get messages for conv1
    messages = await ConversationService.get_conversation_messages(
        conversation_id=conv1.id, session=async_session
    )

    assert len(messages) == 2
    assert messages[0].content == "Conv1 Message 1"
    assert messages[1].content == "Conv1 Message 2"
    assert all(m.conversation_id == conv1.id for m in messages)


@pytest.mark.asyncio
async def test_get_conversation_messages_with_limit(async_session, test_user_id):
    """Test limit parameter for conversation messages.

    Acceptance Criteria:
    - Only requested number of messages returned
    - Oldest messages are prioritized (chronological order)
    """
    # Create conversation
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Add 5 messages
    for i in range(5):
        await ConversationService.add_message(
            conversation_id=conversation.id,
            user_id=test_user_id,
            role="user",
            content=f"Message {i}",
            session=async_session,
        )

    # Get with limit=3
    messages = await ConversationService.get_conversation_messages(
        conversation_id=conversation.id, session=async_session, limit=3
    )

    assert len(messages) == 3
    # Verify oldest messages are returned
    assert messages[0].content == "Message 0"
    assert messages[1].content == "Message 1"
    assert messages[2].content == "Message 2"


@pytest.mark.asyncio
async def test_get_conversation_history_integration(async_session, test_user_id):
    """Test getting conversation history formatted for OpenAI API.

    Acceptance Criteria:
    - History is formatted as list of dicts with 'role' and 'content'
    - Messages are in chronological order
    - Returns None if conversation not found
    - Returns None if user_id doesn't match
    """
    # Create conversation
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Add messages
    await ConversationService.add_message(
        conversation_id=conversation.id,
        user_id=test_user_id,
        role="user",
        content="Hello",
        session=async_session,
    )
    await ConversationService.add_message(
        conversation_id=conversation.id,
        user_id=test_user_id,
        role="assistant",
        content="Hi there!",
        session=async_session,
    )

    # Get history
    history = await ConversationService.get_conversation_history(
        conversation_id=conversation.id, user_id=test_user_id, session=async_session
    )

    assert history is not None
    assert len(history) == 2
    assert history[0] == {"role": "user", "content": "Hello"}
    assert history[1] == {"role": "assistant", "content": "Hi there!"}


@pytest.mark.asyncio
async def test_get_conversation_history_unauthorized(async_session, test_user_id):
    """Test getting history with wrong user_id.

    Acceptance Criteria:
    - Returns None if user_id doesn't match
    - User isolation is enforced
    """
    # Create conversation
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Attempt to get history with different user_id
    history = await ConversationService.get_conversation_history(
        conversation_id=conversation.id,
        user_id="different_user",
        session=async_session,
    )

    assert history is None


@pytest.mark.asyncio
async def test_get_conversation_history_nonexistent(async_session, test_user_id):
    """Test getting history for non-existent conversation.

    Acceptance Criteria:
    - Returns None for non-existent conversation
    """
    history = await ConversationService.get_conversation_history(
        conversation_id=99999, user_id=test_user_id, session=async_session
    )

    assert history is None


@pytest.mark.asyncio
async def test_conversation_empty_history(async_session, test_user_id):
    """Test getting history for conversation with no messages.

    Acceptance Criteria:
    - Returns empty list for new conversation
    """
    # Create conversation without messages
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Get history
    history = await ConversationService.get_conversation_history(
        conversation_id=conversation.id, user_id=test_user_id, session=async_session
    )

    assert history is not None
    assert len(history) == 0


@pytest.mark.asyncio
async def test_conversation_full_workflow_integration(async_session, test_user_id):
    """Test complete conversation workflow.

    Acceptance Criteria:
    - Create conversation
    - Add user message
    - Add assistant response
    - Retrieve history
    - Verify all operations work together
    """
    # Step 1: Create conversation
    conversation = await ConversationService.create_conversation(
        user_id=test_user_id, session=async_session
    )

    # Step 2: Add user message
    await ConversationService.add_message(
        conversation_id=conversation.id,
        user_id=test_user_id,
        role="user",
        content="Add a task to buy groceries",
        session=async_session,
    )

    # Step 3: Add assistant response
    await ConversationService.add_message(
        conversation_id=conversation.id,
        user_id=test_user_id,
        role="assistant",
        content="✓ Added task: Buy groceries (ID: 42)",
        session=async_session,
    )

    # Step 4: Retrieve history
    history = await ConversationService.get_conversation_history(
        conversation_id=conversation.id, user_id=test_user_id, session=async_session
    )

    # Verify workflow
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "Add a task to buy groceries"
    assert history[1]["role"] == "assistant"
    assert "Buy groceries" in history[1]["content"]

    # Step 5: Verify conversation can be retrieved
    conversations = await ConversationService.get_user_conversations(
        user_id=test_user_id, session=async_session
    )
    assert len(conversations) == 1
    assert conversations[0].id == conversation.id
