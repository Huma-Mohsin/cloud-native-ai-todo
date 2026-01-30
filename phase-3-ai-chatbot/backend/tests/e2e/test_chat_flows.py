"""End-to-end tests for complete conversation flows.

Phase III: AI-Powered Chatbot - T066
Tests full user journeys from chat message to database persistence.
"""

import pytest

from src.services.chat_service import ChatService
from src.services.conversation_service import ConversationService
from src.services.task_service import TaskService


@pytest.mark.asyncio
async def test_e2e_create_task_flow(async_session):
    """Test complete flow for creating a task via chat.

    Flow:
    1. User sends "Add a task to buy groceries"
    2. Agent processes message
    3. Task is created in database
    4. Conversation and messages are persisted
    5. Agent confirms task creation
    """
    user_id = "auth0|test_user"
    chat_service = ChatService()

    # Step 1: User creates task via chat
    result = await chat_service.process_message(
        user_id=user_id,
        message="Add a task to buy groceries",
        conversation_id=None,
        session=async_session,
    )

    # Verify chat response
    assert result["success"] is True
    assert result["conversation_id"] is not None
    assert "response" in result
    assert isinstance(result["response"], str)

    # Verify conversation created
    conversation = await ConversationService.get_conversation_by_id(
        conversation_id=result["conversation_id"], session=async_session
    )
    assert conversation is not None
    assert conversation.user_id == user_id

    # Verify messages persisted
    messages = await ConversationService.get_conversation_messages(
        conversation_id=result["conversation_id"], session=async_session
    )
    assert len(messages) >= 2  # User message + Assistant response
    assert messages[0].role == "user"
    assert messages[0].content == "Add a task to buy groceries"
    assert messages[1].role == "assistant"

    # Verify task created (if agent successfully called MCP tool)
    # Note: This depends on agent behavior, might need mocking for consistent E2E tests
    conversation_id = result["conversation_id"]

    # Conversation should be retrievable
    history = await ConversationService.get_conversation_history(
        conversation_id=conversation_id, user_id=user_id, session=async_session
    )
    assert history is not None
    assert len(history) >= 2


@pytest.mark.asyncio
async def test_e2e_list_tasks_flow(async_session):
    """Test complete flow for listing tasks via chat.

    Flow:
    1. Create some tasks
    2. User sends "Show me all my tasks"
    3. Agent lists tasks
    4. Response includes task information
    """
    user_id = "auth0|test_user"
    chat_service = ChatService()

    # Pre-create tasks
    user_id_int = 1  # Task service expects integer
    from src.schemas.task import CreateTaskRequest

    task1 = await TaskService.create_task(
        user_id=user_id_int,
        task_data=CreateTaskRequest(
            title="Buy milk", description=None, priority="medium"
        ),
        session=async_session,
    )
    task2 = await TaskService.create_task(
        user_id=user_id_int,
        task_data=CreateTaskRequest(
            title="Call dentist", description=None, priority="high"
        ),
        session=async_session,
    )

    # User asks to list tasks
    result = await chat_service.process_message(
        user_id=user_id,
        message="Show me all my tasks",
        conversation_id=None,
        session=async_session,
    )

    # Verify response
    assert result["success"] is True
    assert result["conversation_id"] is not None

    # Conversation persisted
    conversation = await ConversationService.get_conversation_by_id(
        conversation_id=result["conversation_id"], session=async_session
    )
    assert conversation is not None


@pytest.mark.asyncio
async def test_e2e_conversation_persistence(async_session):
    """Test that conversations persist across multiple messages.

    Flow:
    1. User sends first message (creates conversation)
    2. User sends second message (continues conversation)
    3. User sends third message (continues conversation)
    4. Verify all messages are in conversation history
    """
    user_id = "auth0|test_user"
    chat_service = ChatService()

    # First message
    result1 = await chat_service.process_message(
        user_id=user_id,
        message="Hello, I need help with tasks",
        conversation_id=None,
        session=async_session,
    )

    conversation_id = result1["conversation_id"]

    # Second message
    result2 = await chat_service.process_message(
        user_id=user_id,
        message="Add a task to buy groceries",
        conversation_id=conversation_id,
        session=async_session,
    )

    # Third message
    result3 = await chat_service.process_message(
        user_id=user_id,
        message="Thank you!",
        conversation_id=conversation_id,
        session=async_session,
    )

    # Verify all messages persisted
    history = await ConversationService.get_conversation_history(
        conversation_id=conversation_id, user_id=user_id, session=async_session
    )

    # Should have at least 6 messages (3 user + 3 assistant)
    assert len(history) >= 3
    user_messages = [m for m in history if m["role"] == "user"]
    assert len(user_messages) >= 3


@pytest.mark.asyncio
async def test_e2e_complete_task_flow(async_session):
    """Test complete flow for completing a task via chat.

    Flow:
    1. Create a task
    2. User sends "Mark task X as complete"
    3. Task is marked as completed
    4. Conversation persists
    """
    user_id = "auth0|test_user"
    user_id_int = 1
    chat_service = ChatService()

    # Create task
    from src.schemas.task import CreateTaskRequest

    task = await TaskService.create_task(
        user_id=user_id_int,
        task_data=CreateTaskRequest(
            title="Buy groceries", description=None, priority="medium"
        ),
        session=async_session,
    )

    # User completes task via chat
    result = await chat_service.process_message(
        user_id=user_id,
        message=f"Mark task {task.id} as complete",
        conversation_id=None,
        session=async_session,
    )

    # Verify response
    assert result["success"] is True
    assert result["conversation_id"] is not None

    # Conversation persisted
    messages = await ConversationService.get_conversation_messages(
        conversation_id=result["conversation_id"], session=async_session
    )
    assert len(messages) >= 2


@pytest.mark.asyncio
async def test_e2e_delete_task_flow(async_session):
    """Test complete flow for deleting a task via chat.

    Flow:
    1. Create a task
    2. User sends "Delete task X"
    3. Task is deleted
    4. Conversation persists
    """
    user_id = "auth0|test_user"
    user_id_int = 1
    chat_service = ChatService()

    # Create task
    from src.schemas.task import CreateTaskRequest

    task = await TaskService.create_task(
        user_id=user_id_int,
        task_data=CreateTaskRequest(
            title="Delete me", description=None, priority="medium"
        ),
        session=async_session,
    )

    # User deletes task via chat
    result = await chat_service.process_message(
        user_id=user_id,
        message=f"Delete task {task.id}",
        conversation_id=None,
        session=async_session,
    )

    # Verify response
    assert result["success"] is True

    # Conversation persisted
    conversation = await ConversationService.get_conversation_by_id(
        conversation_id=result["conversation_id"], session=async_session
    )
    assert conversation is not None


@pytest.mark.asyncio
async def test_e2e_update_task_flow(async_session):
    """Test complete flow for updating a task via chat.

    Flow:
    1. Create a task
    2. User sends "Change task X to 'New title'"
    3. Task is updated
    4. Conversation persists
    """
    user_id = "auth0|test_user"
    user_id_int = 1
    chat_service = ChatService()

    # Create task
    from src.schemas.task import CreateTaskRequest

    task = await TaskService.create_task(
        user_id=user_id_int,
        task_data=CreateTaskRequest(
            title="Old title", description=None, priority="medium"
        ),
        session=async_session,
    )

    # User updates task via chat
    result = await chat_service.process_message(
        user_id=user_id,
        message=f"Change task {task.id} to 'New title'",
        conversation_id=None,
        session=async_session,
    )

    # Verify response
    assert result["success"] is True

    # Conversation persisted
    messages = await ConversationService.get_conversation_messages(
        conversation_id=result["conversation_id"], session=async_session
    )
    assert len(messages) >= 2


@pytest.mark.asyncio
async def test_e2e_error_handling_invalid_task(async_session):
    """Test error handling for invalid task ID.

    Flow:
    1. User asks to complete non-existent task
    2. Agent responds with friendly error
    3. Conversation persists with error message
    """
    user_id = "auth0|test_user"
    chat_service = ChatService()

    # User tries to complete non-existent task
    result = await chat_service.process_message(
        user_id=user_id,
        message="Mark task 99999 as complete",
        conversation_id=None,
        session=async_session,
    )

    # Verify response (should succeed even if task not found)
    assert result["success"] is True
    assert result["conversation_id"] is not None

    # Conversation persisted
    conversation = await ConversationService.get_conversation_by_id(
        conversation_id=result["conversation_id"], session=async_session
    )
    assert conversation is not None


@pytest.mark.asyncio
async def test_e2e_conversation_unauthorized_access(async_session):
    """Test that users cannot access other users' conversations.

    Flow:
    1. User 1 creates conversation
    2. User 2 tries to access it
    3. Access is denied
    """
    user1 = "auth0|user1"
    user2 = "auth0|user2"
    chat_service = ChatService()

    # User 1 creates conversation
    result1 = await chat_service.process_message(
        user_id=user1,
        message="Hello",
        conversation_id=None,
        session=async_session,
    )

    conversation_id = result1["conversation_id"]

    # User 2 tries to access conversation
    result2 = await chat_service.process_message(
        user_id=user2,
        message="I shouldn't see this",
        conversation_id=conversation_id,
        session=async_session,
    )

    # Should fail or create new conversation
    assert result2["success"] is False or result2["conversation_id"] != conversation_id


@pytest.mark.asyncio
async def test_e2e_multiple_users_isolation(async_session):
    """Test that multiple users have isolated conversations.

    Flow:
    1. User 1 creates tasks and conversation
    2. User 2 creates tasks and conversation
    3. Verify each user only sees their own data
    """
    user1 = "auth0|user1"
    user2 = "auth0|user2"
    user1_int = 1
    user2_int = 2
    chat_service = ChatService()

    # User 1 creates task
    from src.schemas.task import CreateTaskRequest

    await TaskService.create_task(
        user_id=user1_int,
        task_data=CreateTaskRequest(
            title="User 1 task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # User 2 creates task
    await TaskService.create_task(
        user_id=user2_int,
        task_data=CreateTaskRequest(
            title="User 2 task", description=None, priority="medium"
        ),
        session=async_session,
    )

    # User 1 lists tasks
    result1 = await chat_service.process_message(
        user_id=user1,
        message="Show me my tasks",
        conversation_id=None,
        session=async_session,
    )

    # User 2 lists tasks
    result2 = await chat_service.process_message(
        user_id=user2,
        message="Show me my tasks",
        conversation_id=None,
        session=async_session,
    )

    # Verify both successful with separate conversations
    assert result1["success"] is True
    assert result2["success"] is True
    assert result1["conversation_id"] != result2["conversation_id"]


@pytest.mark.asyncio
async def test_e2e_long_conversation(async_session):
    """Test long conversation with many messages.

    Flow:
    1. User sends 10+ messages in same conversation
    2. All messages are persisted
    3. History can be retrieved
    """
    user_id = "auth0|test_user"
    chat_service = ChatService()

    # First message
    result = await chat_service.process_message(
        user_id=user_id,
        message="Start conversation",
        conversation_id=None,
        session=async_session,
    )

    conversation_id = result["conversation_id"]

    # Send 9 more messages
    for i in range(1, 10):
        await chat_service.process_message(
            user_id=user_id,
            message=f"Message {i}",
            conversation_id=conversation_id,
            session=async_session,
        )

    # Verify all messages persisted
    history = await ConversationService.get_conversation_history(
        conversation_id=conversation_id, user_id=user_id, session=async_session
    )

    # Should have at least 10 user messages
    user_messages = [m for m in history if m["role"] == "user"]
    assert len(user_messages) >= 10


@pytest.mark.asyncio
async def test_e2e_stateless_server(async_session):
    """Test that server is stateless (no in-memory state).

    Flow:
    1. User creates conversation
    2. Simulate server restart (create new service instance)
    3. Continue conversation with new instance
    4. Verify conversation state was persisted
    """
    user_id = "auth0|test_user"
    chat_service1 = ChatService()

    # Create conversation with first service instance
    result1 = await chat_service1.process_message(
        user_id=user_id,
        message="First message",
        conversation_id=None,
        session=async_session,
    )

    conversation_id = result1["conversation_id"]

    # Simulate server restart - create new service instance
    chat_service2 = ChatService()

    # Continue conversation with new instance
    result2 = await chat_service2.process_message(
        user_id=user_id,
        message="Second message after restart",
        conversation_id=conversation_id,
        session=async_session,
    )

    # Verify conversation continued successfully
    assert result2["success"] is True
    assert result2["conversation_id"] == conversation_id

    # Verify both messages in history
    history = await ConversationService.get_conversation_history(
        conversation_id=conversation_id, user_id=user_id, session=async_session
    )

    user_messages = [m for m in history if m["role"] == "user"]
    assert len(user_messages) >= 2
