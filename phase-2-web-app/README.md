# Phase II: Full-Stack Web Todo Application

A modern, feature-rich todo application built with Next.js 15, FastAPI, and PostgreSQL.

## Features

### Core Features (Phase II Requirements)
- User authentication (signup/login/logout)
- Task CRUD operations (Create, Read, Update, Delete)
- Mark tasks as complete/incomplete
- Responsive UI for desktop, tablet, and mobile
- Data persistence with PostgreSQL
- JWT-based authentication

### Bonus Features (Phase V Advanced Features)
- Priority levels (Low/Medium/High)
- Due dates with calendar picker
- Categories and tags
- Subtasks with progress tracking
- Real-time analytics dashboard
- Export to JSON/CSV
- Sort and filter capabilities
- Search functionality

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.9 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Authentication**: Better Auth with JWT
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: python-jose + passlib
- **Validation**: Pydantic
- **Language**: Python 3.13

## Project Structure

```
phase-2-web-app/
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and types
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # FastAPI backend
│   ├── src/
│   │   ├── models/       # SQLModel database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth and CORS
│   │   └── utils/        # Helpers
│   ├── tests/            # Pytest tests
│   └── pyproject.toml
│
└── README.md             # This file
```

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.13+
- **PostgreSQL** database (or Neon account)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Create .env file
cp .env.example .env
# Edit .env and add your DATABASE_URL and secrets

# Run migrations (if using Alembic)
alembic upgrade head

# Start development server
uvicorn src.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local and add NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname
BETTER_AUTH_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRATION_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-here
```

## Development

### Run Tests

**Backend:**
```bash
cd backend
pytest --cov=src --cov-report=term-missing
```

**Frontend:**
```bash
cd frontend
npm run test:coverage
```

### Code Quality

**Backend:**
```bash
# Format code
ruff format src/

# Lint
ruff check src/

# Type check
mypy src/
```

**Frontend:**
```bash
# Lint
npm run lint

# Type check
npm run type-check
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

**Authentication:**
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/logout` - Logout

**Tasks:**
- `GET /tasks` - Get all user tasks (with filters)
- `POST /tasks` - Create new task
- `GET /tasks/{id}` - Get task by ID
- `PATCH /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
- `GET /tasks/stats` - Get task statistics
- `GET /tasks/export/{format}` - Export tasks (json/csv)

**Subtasks:**
- `GET /tasks/{task_id}/subtasks` - Get task subtasks
- `POST /tasks/{task_id}/subtasks` - Create subtask
- `PATCH /subtasks/{id}` - Update subtask
- `DELETE /subtasks/{id}` - Delete subtask

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
- **Frontend**: Deploy to Vercel (auto-detected Next.js)
- **Backend**: Deploy to Railway or Render using Dockerfile

## Features by Phase

### Phase II (Current) ✅
- User authentication
- Task CRUD operations
- Mark complete/incomplete
- Responsive web UI
- PostgreSQL persistence

### Phase V (Bonus - Already Implemented) ✅
- Priorities, categories, tags
- Due dates
- Subtasks
- Analytics dashboard
- Export functionality
- Search and filters

## Contributing

This project follows Spec-Driven Development (SDD) methodology. All features are specified in `specs/001-phase-ii-web-app/` before implementation.

## License

Part of the Evolution of Todo Hackathon Project - Phase II Submission
