"""Test configuration and fixtures.

Phase III: AI-Powered Chatbot - Test Setup
"""

import os
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Field

# Create a minimal User model for testing (Better Auth manages this in production)
class User(SQLModel, table=True):
    """Minimal User model for testing purposes."""
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True)

# Import all models to ensure SQLModel.metadata has all table definitions
# This must happen before create_all() is called
from src.models.conversation import Conversation  # noqa: F401
from src.models.message import Message  # noqa: F401
from src.models.task import Task  # noqa: F401

# Test database URL (use in-memory SQLite for tests)
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "sqlite+aiosqlite:///:memory:"
)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def async_session():
    """Create a fresh database session for each test.

    This fixture:
    1. Creates a new async engine
    2. Creates all tables
    3. Yields a session for the test
    4. Drops all tables after the test
    """
    # Create async engine
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
    )

    # Create session factory
    async_session_maker = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Create and yield session
    async with async_session_maker() as session:
        yield session

    # Drop all tables after test
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

    # Dispose engine
    await engine.dispose()


@pytest_asyncio.fixture
async def test_user_id():
    """Provide a test user ID."""
    return "auth0|test_user_123"


@pytest_asyncio.fixture
async def test_conversation(async_session, test_user_id):
    """Create a test conversation."""
    from src.models.conversation import Conversation

    conversation = Conversation(user_id=test_user_id)
    async_session.add(conversation)
    await async_session.commit()
    await async_session.refresh(conversation)

    return conversation


@pytest_asyncio.fixture
async def test_task(async_session):
    """Create a test task."""
    from src.models.task import Task

    # Create a simple user_id (integer for tasks table)
    user_id = 1

    task = Task(
        user_id=user_id,
        title="Test Task",
        description="Test Description",
        completed=False,
        priority="medium"
    )

    async_session.add(task)
    await async_session.commit()
    await async_session.refresh(task)

    return task
