# Quickstart Guide: Phase II Web Todo Application

**Feature**: 001-phase-ii-web-app
**Date**: 2025-12-31

## Prerequisites

Before starting, ensure you have:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Python** 3.13+ ([Download](https://www.python.org/downloads/))
- **UV** package manager ([Install](https://github.com/astral-sh/uv))
- **Git** ([Download](https://git-scm.com/))
- **Neon Account** ([Sign up](https://neon.tech/)) - for PostgreSQL database

---

## 1. Database Setup (Neon PostgreSQL)

### 1.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click "Create Project"
3. Project name: `todo-app-phase-ii`
4. Region: Choose closest to you
5. PostgreSQL version: 16
6. Click "Create Project"

### 1.2 Get Connection String

1. In project dashboard, click "Connection Details"
2. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this for backend `.env` file

### 1.3 Create Tables

Tables will be created automatically when backend starts (SQLModel creates them).

---

## 2. Backend Setup (FastAPI)

### 2.1 Navigate to Backend Directory

```bash
cd phase-2-web-app/backend
```

### 2.2 Create Virtual Environment

```bash
uv venv
```

### 2.3 Activate Virtual Environment

**Windows (Git Bash)**:
```bash
source .venv/Scripts/activate
```

**Linux/macOS**:
```bash
source .venv/bin/activate
```

### 2.4 Install Dependencies

```bash
uv pip install -e ".[dev]"
```

### 2.5 Create Environment File

Create `.env` file in `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host/db  # Your Neon connection string

# Authentication
BETTER_AUTH_SECRET=your-32-character-secret-here  # Generate with: openssl rand -hex 32

# CORS
CORS_ORIGINS=http://localhost:3000  # Frontend URL (local dev)

# Environment
ENVIRONMENT=development
```

**Generate BETTER_AUTH_SECRET**:
```bash
openssl rand -hex 32
```

### 2.6 Run Backend Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

API docs at: `http://localhost:8000/docs` (Swagger UI)

---

## 3. Frontend Setup (Next.js)

### 3.1 Navigate to Frontend Directory

Open a new terminal:

```bash
cd phase-2-web-app/frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Create Environment File

Create `.env.local` file in `frontend/` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication
BETTER_AUTH_SECRET=your-32-character-secret-here  # SAME as backend!

# Environment
NODE_ENV=development
```

**IMPORTANT**: `BETTER_AUTH_SECRET` must be **identical** in both frontend and backend!

### 3.4 Run Frontend Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

---

## 4. Testing the Application

### 4.1 Open Browser

Navigate to: `http://localhost:3000`

### 4.2 Create Account

1. Click "Sign Up"
2. Enter:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"

### 4.3 Login

1. Use the credentials you just created
2. Click "Login"
3. You should be redirected to dashboard

### 4.4 Create Tasks

1. Click "Add New Task"
2. Enter title: "Test Task"
3. Enter description (optional): "This is a test"
4. Click "Create"
5. Task appears in your list

### 4.5 Test Operations

- ✅ **View**: See all your tasks
- ✅ **Update**: Click "Edit" on a task
- ✅ **Complete**: Click checkbox to toggle
- ✅ **Delete**: Click "Delete" button

---

## 5. Running Tests

### 5.1 Backend Tests

```bash
cd phase-2-web-app/backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=term-missing --cov-report=html

# View HTML coverage report
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

### 5.2 Frontend Tests

```bash
cd phase-2-web-app/frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- TaskList.test.tsx
```

---

## 6. Development Workflow

### 6.1 Start Both Servers

**Terminal 1 (Backend)**:
```bash
cd phase-2-web-app/backend
source .venv/Scripts/activate  # or .venv/bin/activate
uvicorn src.main:app --reload
```

**Terminal 2 (Frontend)**:
```bash
cd phase-2-web-app/frontend
npm run dev
```

### 6.2 Code Quality Checks

**Backend**:
```bash
# Format code
ruff format src/ tests/

# Lint code
ruff check src/ tests/

# Type check
mypy --strict src/
```

**Frontend**:
```bash
# Lint and format
npm run lint

# Type check
npm run type-check
```

---

## 7. Deployment

### 7.1 Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework: Next.js
   - Root Directory: `phase-2-web-app/frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (Railway/Render)
   - `BETTER_AUTH_SECRET`: Same secret as backend
7. Click "Deploy"

### 7.2 Backend Deployment (Railway)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Configure:
   - Root Directory: `phase-2-web-app/backend`
   - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `DATABASE_URL`: Your Neon connection string
   - `BETTER_AUTH_SECRET`: Same secret as frontend
   - `CORS_ORIGINS`: Your Vercel deployment URL
   - `ENVIRONMENT`: production
6. Click "Deploy"

### 7.3 Update Frontend API URL

After backend deploys:
1. Copy Railway deployment URL
2. Update Vercel environment variable:
   - `NEXT_PUBLIC_API_URL`: https://your-backend.railway.app
3. Redeploy frontend

---

## 8. Troubleshooting

### Issue: "Connection refused" when accessing API

**Solution**: Make sure backend server is running on port 8000

```bash
# Check if port is in use
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process if needed
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: "Invalid credentials" on login

**Solution**: Check that `BETTER_AUTH_SECRET` is identical in both frontend and backend

### Issue: "CORS error" in browser console

**Solution**: Add frontend URL to backend `CORS_ORIGINS`:
```bash
# In backend .env
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

### Issue: Database connection error

**Solution**:
1. Check `DATABASE_URL` format includes `+asyncpg` driver
2. Ensure Neon project is active (not paused)
3. Verify connection string in Neon dashboard

### Issue: "Module not found" errors

**Solution**:
```bash
# Backend
cd phase-2-web-app/backend
rm -rf .venv
uv venv
source .venv/Scripts/activate
uv pip install -e ".[dev]"

# Frontend
cd phase-2-web-app/frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 9. Useful Commands

### Backend

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check database connection
python -c "from src.database import engine; print('Connected!')"
```

### Frontend

```bash
# Build for production
npm run build

# Start production server
npm start

# Analyze bundle size
npm run build -- --analyze
```

---

## 10. Next Steps

After setup is complete:

1. ✅ Verify all 5 Basic Level features work (Add, View, Update, Delete, Complete)
2. ✅ Run test suites (backend ≥80%, frontend ≥70% coverage)
3. ✅ Test data isolation (create second user, verify tasks are separate)
4. ✅ Deploy to Vercel + Railway/Render
5. ✅ Record demo video (<90 seconds)
6. ✅ Submit to hackathon

---

**Questions?** Check the main README.md or review specs in `specs/001-phase-ii-web-app/`

**Good luck with Phase II!** 🚀
