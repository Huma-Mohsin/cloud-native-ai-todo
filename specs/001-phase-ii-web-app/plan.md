# Implementation Plan: Phase II Full-Stack Web Todo Application

**Branch**: `001-phase-ii-web-app` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phase-ii-web-app/spec.md`

## Summary

Transform the Phase I in-memory console todo application into a multi-user web application with authentication and database persistence. The system will provide a responsive web interface for the same 5 Basic Level features (Add, View, Update, Delete, Mark Complete) with JWT-based authentication ensuring complete data isolation between users. All data will persist in PostgreSQL, replacing the in-memory storage from Phase I.

**Primary Requirement**: Multi-user web todo application with secure authentication and database-backed task management.

**Technical Approach**: Modern full-stack architecture using Next.js 16+ App Router for the frontend, FastAPI for the backend API, SQLModel ORM for database operations, Better Auth with JWT for authentication, and Neon Serverless PostgreSQL for data persistence. The system follows RESTful API design patterns with user-scoped endpoints (`/api/{user_id}/tasks`).

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.0+ (via Next.js 16+)
- Backend: Python 3.13+

**Primary Dependencies**:
- Frontend: Next.js 16+, React 18+, Tailwind CSS 3.4+, Better Auth (JWT plugin), TypeScript
- Backend: FastAPI 0.110+, SQLModel 0.0.14+, Pydantic 2.0+, Python-JOSE (JWT), Passlib (password hashing), Uvicorn (ASGI server)
- Database: Neon Serverless PostgreSQL (compatible with PostgreSQL 16)

**Storage**: Neon Serverless PostgreSQL with two main tables (users, tasks) managed via SQLModel ORM

**Testing**:
- Frontend: Vitest or Jest, React Testing Library, Playwright (E2E optional)
- Backend: pytest, pytest-asyncio, httpx (for FastAPI testing), coverage.py

**Target Platform**:
- Frontend: Vercel (serverless deployment)
- Backend: Railway or Render (containerized deployment)
- Database: Neon Serverless (cloud-hosted PostgreSQL)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- API response time: <200ms p95 for CRUD operations
- Page load time: <3 seconds for dashboard with 50 tasks
- Database query time: <100ms p95
- Authentication: <500ms for login/signup

**Constraints**:
- Test coverage: ≥80% backend, ≥70% frontend
- No advanced features (priorities, tags, due dates - reserved for Phase V)
- Must maintain all 5 Basic Level features from Phase I
- JWT token expiration: 24 hours
- Task title: max 200 characters
- Task description: max 1000 characters
- Concurrent users: support 10+ simultaneous users

**Scale/Scope**:
- Expected users: 10-50 concurrent users (Phase II MVP)
- Tasks per user: up to 100 tasks (no pagination required)
- API endpoints: ~8 RESTful endpoints
- Frontend pages: 3 pages (login, signup, dashboard)
- Frontend components: ~10-15 reusable components
- Database tables: 2 main tables (users, tasks)


## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Technology Stack Compliance

**Constitution Requirement**: Must use Next.js 16+ App Router, FastAPI, SQLModel, Neon PostgreSQL, Better Auth with JWT

**Plan Alignment**:
- ✅ Frontend: Next.js 16+ with App Router
- ✅ Backend: FastAPI with SQLModel ORM
- ✅ Database: Neon Serverless PostgreSQL
- ✅ Authentication: Better Auth with JWT tokens
- ✅ Styling: Tailwind CSS (constitution-mandated)
- ✅ Type Safety: TypeScript strict mode (frontend), mypy strict (backend)

**Status**: PASS - All required technologies specified

### ✅ Feature Completeness

**Constitution Requirement**: Must implement all 5 Basic Level features, no advanced features in Phase II

**Plan Alignment**:
- ✅ Add Task (FR-008 to FR-013)
- ✅ View Tasks (FR-014 to FR-017)
- ✅ Update Task (FR-018 to FR-022)
- ✅ Delete Task (FR-023 to FR-026)
- ✅ Mark Complete/Pending (FR-019)
- ✅ No advanced features (priorities, tags, due dates explicitly out of scope)

**Status**: PASS - All basic features included, no feature degradation

### ✅ Security & Privacy

**Constitution Requirement**: JWT authentication, data isolation, secure password storage, no secrets in code

**Plan Alignment**:
- ✅ JWT-based authentication (FR-004, FR-005, FR-006)
- ✅ User data isolation (FR-007, FR-016, FR-022, FR-026)
- ✅ Password hashing required (FR-036)
- ✅ Environment variables for secrets (FR-037)
- ✅ CORS configuration (FR-038)
- ✅ Rate limiting on auth endpoints (FR-039)

**Status**: PASS - Security requirements comprehensive

### ✅ Testing Standards

**Constitution Requirement**: TDD approach, ≥80% backend coverage, ≥70% frontend coverage

**Plan Alignment**:
- ✅ Backend: pytest with coverage ≥80% (SC-013)
- ✅ Frontend: Vitest/Jest with coverage ≥70% (SC-014)
- ✅ TDD workflow from Phase I can be reused
- ✅ Test verification methods defined in spec

**Status**: PASS - Testing requirements meet constitution

### ✅ API Design Standards

**Constitution Requirement**: RESTful API under /api/{user_id}/tasks, proper HTTP methods and status codes

**Plan Alignment**:
- ✅ User-scoped endpoints: `/api/{user_id}/tasks` (FR-027)
- ✅ HTTP methods: GET, POST, PUT, DELETE, PATCH (FR-028)
- ✅ Status codes: 200, 201, 204, 400, 401, 403, 404, 500 (FR-029)
- ✅ JSON payloads with Content-Type headers (FR-030)
- ✅ User ID validation from JWT (FR-031)

**Status**: PASS - API design follows constitution standards

### ✅ Database Standards

**Constitution Requirement**: PostgreSQL with SQLModel, proper schema design, migrations, foreign keys

**Plan Alignment**:
- ✅ PostgreSQL (Neon Serverless) specified
- ✅ SQLModel ORM for all database operations
- ✅ Tables: users (managed by Better Auth), tasks (custom)
- ✅ Foreign key constraints (FR-035)
- ✅ Timestamps: created_at, updated_at required
- ✅ Database transactions (FR-034)

**Status**: PASS - Database design aligned with constitution

### Constitution Check Summary

**Overall Status**: ✅ **PASS** - Ready for Phase 0 research

**Total Gates**: 6
**Passed**: 6
**Failed**: 0

All constitutional requirements are met. The plan aligns with technology stack, feature scope, security standards, testing requirements, API design, and database standards.

## Project Structure

### Documentation (this feature)

```
specs/001-phase-ii-web-app/
├── spec.md              # ✅ Feature specification (completed)
├── plan.md              # ✅ This file (in progress)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── openapi.yaml     # Backend API contract
│   └── types.ts         # Frontend API types
├── checklists/
│   └── requirements.md  # ✅ Specification validation (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```
phase-2-web-app/
├── frontend/
│   ├── app/                      # Next.js 16+ App Router
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/page.tsx   # Protected route
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   ├── ui/                  # Reusable UI
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskForm.tsx
│   │   └── AuthForm.tsx
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── auth.ts              # Better Auth config
│   │   ├── types.ts             # TypeScript types
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   └── useApi.ts
│   ├── tests/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   └── task.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   └── tasks.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   └── task_service.py
│   │   ├── middleware/
│   │   │   ├── auth.py
│   │   │   └── cors.py
│   │   └── utils/
│   │       ├── security.py
│   │       └── validators.py
│   ├── tests/
│   ├── pyproject.toml
│   └── README.md
│
└── README.md                    # Phase II overview
```

**Structure Decision**: Selected web application structure (frontend + backend) since this is a full-stack app. Frontend uses Next.js App Router conventions, backend uses FastAPI layered architecture. This aligns with constitution requirements and industry best practices.

## Complexity Tracking

**Status**: No violations detected. Constitution Check passed all 6 gates. No complexity justifications needed.

---

## Phase 0: Research & Decision Log

**Purpose**: Document technical decisions and best practices.

### Research Tasks

1. **Better Auth + Next.js 16+ App Router Integration**
   - Configure Better Auth with JWT plugin
   - Setup auth.ts client in Next.js
   - Handle server/client components

2. **FastAPI + Better Auth JWT Verification**
   - Verify Better Auth JWT tokens in FastAPI
   - Shared secret configuration
   - JWT verification middleware

3. **Neon PostgreSQL Connection Pooling**
   - Connection pooling with Neon Serverless
   - FastAPI database session management
   - Connection string configuration

4. **Next.js Server vs Client Components**
   - When to use Server Components
   - When 'use client' is required
   - Optimal rendering strategy

5. **Environment Variable Management**
   - Vercel + Railway/Render env var sync
   - Shared JWT_SECRET across deployments
   - DATABASE_URL security

**Output**: research.md with decisions and rationale (to be created)

---

## Phase 1: Design & Contracts

### 1.1 Data Model

**User Entity** (managed by Better Auth):
- id: string (UUID, primary key)
- name: string (not null)
- email: string (unique, not null)
- password: string (hashed)
- created_at: timestamp

**Task Entity**:
- id: integer (auto-increment, primary key)
- user_id: string (FK -> users.id, indexed)
- title: string (1-200 chars, not null)
- description: text (0-1000 chars, nullable)
- completed: boolean (default false, indexed)
- created_at: timestamp
- updated_at: timestamp

**Relationships**: One user has many tasks

**Output**: data-model.md (to be created)

### 1.2 API Contracts

**Endpoints**:

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| POST | `/auth/signup` | Register | `{name, email, password}` | `{user, token}` |
| POST | `/auth/login` | Login | `{email, password}` | `{user, token}` |
| GET | `/api/{user_id}/tasks` | List tasks | - | `[{task}]` |
| POST | `/api/{user_id}/tasks` | Create task | `{title, description?}` | `{task}` |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | `{title?, description?}` | `{task}` |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | - | `204` |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle complete | - | `{task}` |

**Output**: 
- contracts/openapi.yaml (to be created)
- contracts/types.ts (to be created)

### 1.3 Quickstart Guide

**Sections**:
1. Prerequisites
2. Database Setup (Neon)
3. Backend Setup
4. Frontend Setup
5. Testing
6. Deployment

**Output**: quickstart.md (to be created)

---

## Next Steps

1. ✅ Plan created (this file)
2. ⏳ Generate research.md
3. ⏳ Generate data-model.md
4. ⏳ Generate contracts/
5. ⏳ Generate quickstart.md
6. ⏳ Run /sp.tasks
7. ⏳ Run /sp.implement

**Plan Status**: ✅ Complete - Ready for artifact generation
