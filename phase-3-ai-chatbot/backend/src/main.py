"""FastAPI application for Phase III AI-Powered Chatbot.

This is the main entry point for the Phase III backend server.
"""

# Load environment variables BEFORE any imports
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request as StarletteRequest
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import logging

from .api.routes import chat
from .api.routes import websocket
from .api.routes import tasks
from .api.routes import reminders
from .database import init_db
from .middleware.rate_limit import limiter, rate_limit_exceeded_handler

logging.basicConfig(level=logging.DEBUG)


# Create FastAPI app
app = FastAPI(
    title="Phase III AI-Powered Todo Chatbot",
    description="Natural language task management with OpenAI Agents SDK and MCP",
    version="3.0.0",
)

# Configure CORS FIRST (middleware executes in reverse order)
# IMPORTANT: Must use specific origins (not *) when allow_credentials=True
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003"
    ],
    allow_credentials=True,  # Required for cookies
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],  # Allow all response headers
    max_age=3600,  # Cache preflight for 1 hour
)

# Debug middleware to check Origin header (AFTER CORS)
@app.middleware("http")
async def debug_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    logging.info(f"{request.method} {request.url.path} from Origin: {origin}")
    response = await call_next(request)
    cors_header = response.headers.get("access-control-allow-origin")
    logging.info(f"Response CORS header: {cors_header}")
    return response

# Add rate limiter to app state (AFTER CORS)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Include routers
app.include_router(chat.router)
app.include_router(websocket.router)
app.include_router(tasks.router)
app.include_router(reminders.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    await init_db()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Phase III AI-Powered Todo Chatbot API",
        "version": "3.0.0",
        "endpoints": {
            "chat": "POST /api/{user_id}/chat",
            "tasks": "GET /api/tasks",
            "reminders": "GET /api/reminders/{user_id}/pending",
            "docs": "/docs",
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "phase": "III"}


@app.get("/debug/cookies")
async def debug_cookies(request: Request):
    """Debug endpoint to see all cookies."""
    return {
        "all_cookies": dict(request.cookies),
        "cookie_count": len(request.cookies)
    }
