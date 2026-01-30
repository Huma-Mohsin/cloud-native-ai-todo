"""Database configuration and session management.

Phase III: AI-Powered Chatbot - Database Layer
"""

import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel


# Get database URL from environment (REQUIRED)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is required. "
        "Please set it in your .env file with your PostgreSQL connection string."
    )

# Create async engine with Neon-optimized connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=5,  # Smaller pool for serverless
    max_overflow=10,  # Allow temporary connections
    pool_recycle=300,  # Recycle connections every 5 minutes (Neon timeout is ~5min)
    connect_args={
        "server_settings": {"application_name": "phase3-chatbot"},
        "command_timeout": 60,
        "timeout": 30,
    },
)

# Create async session factory
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session for dependency injection.

    Yields:
        AsyncSession: Database session
    """
    async with async_session_maker() as session:
        yield session


async def init_db():
    """Initialize database tables.

    Creates all tables defined in SQLModel metadata.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
