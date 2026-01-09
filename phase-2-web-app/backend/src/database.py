"""Database setup and session management module.

This module provides async database engine, session management, and
database initialization functionality using SQLModel.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from .config import settings

# Create async engine with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",  # Log SQL in development
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Maximum number of connections
    max_overflow=20,  # Maximum overflow connections
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions.

    This function is used as a FastAPI dependency to provide database
    sessions to route handlers. It ensures proper session cleanup.

    Yields:
        AsyncSession: Database session

    Example:
        @app.get("/users")
        async def get_users(session: AsyncSession = Depends(get_session)):
            result = await session.execute(select(User))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables() -> None:
    """Create all database tables.

    This function should be called on application startup to ensure
    all required tables exist in the database.

    Note:
        In production, use Alembic migrations instead of this function.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def drop_tables() -> None:
    """Drop all database tables.

    Warning:
        This function is destructive and should only be used in tests
        or development environments.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


async def dispose_engine() -> None:
    """Dispose of the database engine and close all connections.

    This function should be called on application shutdown to ensure
    proper cleanup of database connections.
    """
    await engine.dispose()
