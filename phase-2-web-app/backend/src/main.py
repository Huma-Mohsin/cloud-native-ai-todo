"""FastAPI application entry point.

This module initializes the FastAPI application, configures middleware,
and registers route handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import create_tables, dispose_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager.

    Handles startup and shutdown events for the FastAPI application.

    Args:
        app: FastAPI application instance

    Yields:
        Control to the application
    """
    # Startup: Create database tables
    print("Starting up: Creating database tables...")
    await create_tables()
    print("Database tables created successfully")

    yield

    # Shutdown: Dispose database engine
    print("Shutting down: Disposing database engine...")
    await dispose_engine()
    print("Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Todo API - Phase II",
    description="Multi-user todo application with JWT authentication",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS middleware
print(f"[CONFIG] Configuring CORS with origins: {settings.cors_origins_list}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("[SUCCESS] CORS middleware configured successfully")


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint.

    Returns:
        dict: Health status and environment
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "2.0.0"
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information.

    Returns:
        dict: API welcome message and documentation links
    """
    return {
        "message": "Todo API - Phase II",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# Import and register routers
from .routes import auth_router, tasks_router, subtasks_router

# Register authentication routes
app.include_router(auth_router)

# Register task routes
app.include_router(tasks_router)

# Register subtask routes
app.include_router(subtasks_router)
