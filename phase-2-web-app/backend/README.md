# Todo Backend - Phase II

FastAPI backend for multi-user todo application with JWT authentication and PostgreSQL persistence.

## Tech Stack

- **Framework**: FastAPI 0.110+
- **ORM**: SQLModel 0.0.14+
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT with Better Auth shared secret
- **Testing**: pytest, pytest-asyncio, httpx
- **Code Quality**: ruff (linter/formatter), mypy (type checker)

## Setup

### Prerequisites

- Python 3.13+
- UV package manager
- Neon PostgreSQL database

### Installation

```bash
# Create virtual environment
uv venv

# Activate virtual environment (Windows Git Bash)
source .venv/Scripts/activate

# Install dependencies
uv pip install -e ".[dev]"
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
BETTER_AUTH_SECRET=<32-char-secret>  # Generate with: openssl rand -hex 32
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### Run Development Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=src --cov-report=term-missing --cov-report=html
```

## Code Quality

```bash
# Format code
ruff format src/ tests/

# Lint code
ruff check src/ tests/

# Type check
mypy --strict src/
```

## Project Structure

```
backend/
├── src/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── database.py          # Database setup
│   ├── models/              # SQLModel models
│   ├── schemas/             # Pydantic schemas
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   ├── middleware/          # Middleware (auth, CORS)
│   └── utils/               # Utilities
└── tests/                   # Test files
```

## API Endpoints

- **Auth**: `POST /auth/signup`, `POST /auth/login`
- **Tasks**: `GET/POST /api/{user_id}/tasks`
- **Task Detail**: `GET/PUT/DELETE/PATCH /api/{user_id}/tasks/{id}`

See `/docs` for complete API documentation.
