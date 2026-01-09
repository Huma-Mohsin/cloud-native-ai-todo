# Implementation Tasks: Phase II Full-Stack Web Todo Application

**Feature**: 001-phase-ii-web-app
**Branch**: `001-phase-ii-web-app`
**Date**: 2025-12-31

## Overview

This document breaks down the Phase II full-stack web todo application into executable tasks organized by user story. Each user story can be implemented and tested independently, enabling incremental delivery.

**Total Tasks**: 87 tasks
**Estimated Parallel Opportunities**: 45+ tasks can run in parallel
**Test Coverage Target**: ≥80% backend, ≥70% frontend

---

## Task Organization Strategy

Tasks are organized by **User Story Priority** (from spec.md):
- **Setup Phase**: Project initialization (all projects)
- **Foundational Phase**: Shared infrastructure (blocks all stories)
- **User Story Phases**: P1 → P2 → P3 → P4 (prioritized delivery)
- **Polish Phase**: Cross-cutting concerns

**MVP Scope**: Complete Phase 1 + Phase 2 + Phase 3 (User Story 1) for minimum viable authentication

---

## Dependency Graph

```
Setup Phase (Phase 1)
    ↓
Foundational Phase (Phase 2) ← Must complete before user stories
    ↓
┌───────────────┬───────────────┬───────────────┬───────────────┐
│   User Story 1 │  User Story 2 │  User Story 3 │  User Story 4 │
│   (P1: Auth)   │  (P2: Create) │  (P3: Update) │  (P4: Delete) │
│   BLOCKS US2   │  Independent  │  Independent  │  Independent  │
└───────────────┴───────────────┴───────────────┴───────────────┘
    ↓               ↓               ↓               ↓
                 Polish Phase (Phase 7)
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2)
**Parallel Paths**: US3 and US4 can run parallel to US2 after US1 complete

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize project structure, configure tools, and establish development environment

**Tasks**:

- [ ] T001 Create phase-2-web-app directory structure per plan.md
- [ ] T002 [P] Initialize backend Python project with UV in phase-2-web-app/backend/
- [ ] T003 [P] Initialize frontend Next.js project in phase-2-web-app/frontend/
- [ ] T004 [P] Create backend pyproject.toml with dependencies (FastAPI, SQLModel, Pydantic, python-jose, passlib, uvicorn) in phase-2-web-app/backend/
- [ ] T005 [P] Create frontend package.json with dependencies (Next.js 16+, React 18+, Tailwind CSS, Better Auth) in phase-2-web-app/frontend/
- [ ] T006 [P] Configure ruff.toml for backend linting in phase-2-web-app/backend/
- [ ] T007 [P] Configure mypy.ini for backend type checking in phase-2-web-app/backend/
- [ ] T008 [P] Configure ESLint and Prettier for frontend in phase-2-web-app/frontend/
- [ ] T009 [P] Configure Tailwind CSS in phase-2-web-app/frontend/tailwind.config.ts
- [ ] T010 [P] Configure TypeScript strict mode in phase-2-web-app/frontend/tsconfig.json
- [ ] T011 [P] Create backend .env.example with DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS templates in phase-2-web-app/backend/
- [ ] T012 [P] Create frontend .env.local.example with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET templates in phase-2-web-app/frontend/
- [ ] T013 [P] Create backend README.md with setup instructions in phase-2-web-app/backend/
- [ ] T014 [P] Create frontend README.md with setup instructions in phase-2-web-app/frontend/
- [ ] T015 Setup Neon PostgreSQL project and obtain DATABASE_URL connection string
- [ ] T016 [P] Create docker-compose.yml for local PostgreSQL development in phase-2-web-app/
- [ ] T017 [P] Create .gitignore for backend (.venv, __pycache__, .env) in phase-2-web-app/backend/
- [ ] T018 [P] Create .gitignore for frontend (node_modules, .next, .env.local) in phase-2-web-app/frontend/

**Completion Criteria**:
- ✅ Both backend and frontend projects initialize without errors
- ✅ All configuration files valid and linters pass
- ✅ .env.example files document all required environment variables
- ✅ README files provide clear setup instructions

---

## Phase 2: Foundational (Shared Infrastructure)

**Goal**: Implement shared components required by all user stories (database, models, utilities)

**Dependencies**: Must complete Phase 1

**Tasks**:

- [ ] T019 Create database configuration in phase-2-web-app/backend/src/config.py (load env vars, validate DATABASE_URL, BETTER_AUTH_SECRET)
- [ ] T020 Create async database engine and session management in phase-2-web-app/backend/src/database.py (SQLModel async engine with connection pooling)
- [ ] T021 [P] Create User SQLModel in phase-2-web-app/backend/src/models/user.py (id, name, email, password, created_at)
- [ ] T022 [P] Create Task SQLModel in phase-2-web-app/backend/src/models/task.py (id, user_id, title, description, completed, created_at, updated_at)
- [ ] T023 [P] Create User Pydantic schemas in phase-2-web-app/backend/src/schemas/user.py (SignupRequest, LoginRequest, UserResponse)
- [ ] T024 [P] Create Task Pydantic schemas in phase-2-web-app/backend/src/schemas/task.py (CreateTaskRequest, UpdateTaskRequest, TaskResponse)
- [ ] T025 [P] Create password hashing utilities in phase-2-web-app/backend/src/utils/security.py (hash_password, verify_password using passlib bcrypt)
- [ ] T026 [P] Create JWT utilities in phase-2-web-app/backend/src/utils/security.py (create_jwt_token, verify_jwt_token using python-jose)
- [ ] T027 [P] Create input validators in phase-2-web-app/backend/src/utils/validators.py (validate_email, validate_password_strength, validate_title_length)
- [ ] T028 Create FastAPI application instance in phase-2-web-app/backend/src/main.py (app = FastAPI with metadata)
- [ ] T029 Configure CORS middleware in phase-2-web-app/backend/src/middleware/cors.py (allow origins from env var)
- [ ] T030 Create database initialization script in phase-2-web-app/backend/src/database.py (create_tables function using SQLModel.metadata.create_all)
- [ ] T031 [P] Create API client utility in phase-2-web-app/frontend/lib/api.ts (fetchAPI with auth header injection)
- [ ] T032 [P] Create TypeScript types in phase-2-web-app/frontend/lib/types.ts (User, Task, API request/response types from contracts/types.ts)
- [ ] T033 [P] Create utility functions in phase-2-web-app/frontend/lib/utils.ts (formatDate, classNames for Tailwind)
- [ ] T034 [P] Create global CSS with Tailwind directives in phase-2-web-app/frontend/app/globals.css

**Completion Criteria**:
- ✅ Database connection successful (verify with test script)
- ✅ SQLModel models match data-model.md specification
- ✅ Password hashing works (verify hash != plaintext)
- ✅ JWT tokens can be created and verified
- ✅ CORS configured for localhost:3000
- ✅ TypeScript types compile without errors

---

## Phase 3: User Story 1 (P1) - User Registration and Authentication

**Goal**: Implement user signup, login, logout, and route protection

**User Story**: As a new user, I want to create an account and log in so that I can securely access my personal todo list from any device with a web browser.

**Independent Test**: Create account → Login → Access dashboard → Logout → Verify redirect

**Dependencies**: Must complete Phase 2

**Tasks**:

### Backend - Authentication Service

- [ ] T035 [US1] Create AuthService in phase-2-web-app/backend/src/services/auth_service.py (signup, login methods with database operations)
- [ ] T036 [US1] Implement signup logic in AuthService (validate email uniqueness, hash password, create user, return JWT)
- [ ] T037 [US1] Implement login logic in AuthService (verify email exists, verify password, return JWT)

### Backend - Authentication Routes

- [ ] T038 [US1] Create auth router in phase-2-web-app/backend/src/routes/auth.py (FastAPI APIRouter)
- [ ] T039 [US1] Implement POST /auth/signup endpoint (call AuthService.signup, return 201 or 400/409)
- [ ] T040 [US1] Implement POST /auth/login endpoint (call AuthService.login, return 200 or 401)
- [ ] T041 [US1] Implement POST /auth/logout endpoint (return 200 with success message - client-side token removal)

### Backend - JWT Middleware

- [ ] T042 [US1] Create JWT verification middleware in phase-2-web-app/backend/src/middleware/auth.py (verify Authorization header, decode token, inject user_id into request.state)
- [ ] T043 [US1] Create dependency for protected routes in phase-2-web-app/backend/src/middleware/auth.py (get_current_user extracts user_id from request.state)
- [ ] T044 [US1] Add middleware to FastAPI app for /api/* routes in phase-2-web-app/backend/src/main.py

### Frontend - Better Auth Configuration

- [ ] T045 [P] [US1] Configure Better Auth client in phase-2-web-app/frontend/lib/auth.ts (JWT plugin, API endpoints)
- [ ] T046 [P] [US1] Create useAuth hook in phase-2-web-app/frontend/hooks/useAuth.ts (login, signup, logout, user state)

### Frontend - Authentication Forms

- [ ] T047 [P] [US1] Create AuthForm component in phase-2-web-app/frontend/components/AuthForm.tsx (reusable for login/signup with form validation)
- [ ] T048 [P] [US1] Create Input component in phase-2-web-app/frontend/components/ui/Input.tsx (Tailwind styled input with error display)
- [ ] T049 [P] [US1] Create Button component in phase-2-web-app/frontend/components/ui/Button.tsx (Tailwind styled with loading state)

### Frontend - Authentication Pages

- [ ] T050 [US1] Create login page in phase-2-web-app/frontend/app/(auth)/login/page.tsx (use AuthForm, call useAuth.login, redirect to dashboard)
- [ ] T051 [US1] Create signup page in phase-2-web-app/frontend/app/(auth)/signup/page.tsx (use AuthForm, call useAuth.signup, redirect to dashboard)
- [ ] T052 [US1] Create root layout in phase-2-web-app/frontend/app/layout.tsx (metadata, global CSS import, auth provider)
- [ ] T053 [US1] Create home page in phase-2-web-app/frontend/app/page.tsx (redirect to /dashboard if authenticated, /login if not)

### Frontend - Route Protection

- [ ] T054 [US1] Create middleware for route protection in phase-2-web-app/frontend/middleware.ts (check auth token, redirect unauthenticated users to /login)

### Backend Tests

- [ ] T055 [P] [US1] Write tests for password hashing in phase-2-web-app/backend/tests/test_security.py (verify hash != plaintext, verify_password works)
- [ ] T056 [P] [US1] Write tests for JWT creation/verification in phase-2-web-app/backend/tests/test_security.py (create token, decode token, verify user_id)
- [ ] T057 [P] [US1] Write tests for POST /auth/signup in phase-2-web-app/backend/tests/test_auth.py (success 201, duplicate email 409, invalid email 400)
- [ ] T058 [P] [US1] Write tests for POST /auth/login in phase-2-web-app/backend/tests/test_auth.py (success 200, invalid credentials 401)
- [ ] T059 [P] [US1] Write tests for JWT middleware in phase-2-web-app/backend/tests/test_auth.py (valid token passes, invalid token 401, missing token 401)

### Frontend Tests

- [ ] T060 [P] [US1] Write tests for AuthForm component in phase-2-web-app/frontend/tests/components/AuthForm.test.tsx (renders inputs, validates on submit, calls onSubmit)
- [ ] T061 [P] [US1] Write tests for useAuth hook in phase-2-web-app/frontend/tests/hooks/useAuth.test.ts (login sets token, logout clears token)

**Completion Criteria**:
- ✅ User can signup with valid credentials (name, email, password)
- ✅ Duplicate email returns 409 error with clear message
- ✅ User can login with correct credentials and receive JWT token
- ✅ Invalid credentials return 401 error
- ✅ Unauthenticated users redirected to /login when accessing /dashboard
- ✅ Authenticated users can access /dashboard
- ✅ Logout clears token and redirects to /login
- ✅ Backend tests pass with ≥80% coverage
- ✅ Frontend tests pass with ≥70% coverage

---

## Phase 4: User Story 2 (P2) - Task Creation and Viewing

**Goal**: Implement task creation and viewing for authenticated users

**User Story**: As an authenticated user, I want to create new tasks and view my complete task list so that I can track all my to-do items in one place.

**Independent Test**: Login → Create task with title/description → View task in list → Create task with title only → Verify both appear → Verify data isolation (other user's tasks not visible)

**Dependencies**: Must complete Phase 3 (US1 - authentication required)

**Tasks**:

### Backend - Task Service

- [ ] T062 [US2] Create TaskService in phase-2-web-app/backend/src/services/task_service.py (CRUD operations with user_id filtering)
- [ ] T063 [US2] Implement get_tasks method in TaskService (filter by user_id, order by created_at DESC)
- [ ] T064 [US2] Implement create_task method in TaskService (validate title, set user_id, save to database)

### Backend - Task Routes

- [ ] T065 [US2] Create task router in phase-2-web-app/backend/src/routes/tasks.py (FastAPI APIRouter with /api/{user_id}/tasks prefix)
- [ ] T066 [US2] Implement GET /api/{user_id}/tasks endpoint (call TaskService.get_tasks, verify user_id matches JWT, return 200)
- [ ] T067 [US2] Implement POST /api/{user_id}/tasks endpoint (call TaskService.create_task, verify user_id matches JWT, return 201)
- [ ] T068 [US2] Add user_id validation to all task endpoints (403 if JWT user_id != path user_id)

### Frontend - Task Components

- [ ] T069 [P] [US2] Create TaskList component in phase-2-web-app/frontend/components/TaskList.tsx (display array of tasks, handle empty state)
- [ ] T070 [P] [US2] Create TaskItem component in phase-2-web-app/frontend/components/TaskItem.tsx (display single task with title, description, completion status)
- [ ] T071 [P] [US2] Create TaskForm component in phase-2-web-app/frontend/components/TaskForm.tsx (title input, description textarea, submit button)
- [ ] T072 [P] [US2] Create Card component in phase-2-web-app/frontend/components/ui/Card.tsx (Tailwind styled container for tasks)

### Frontend - Task Management Hook

- [ ] T073 [US2] Create useTasks hook in phase-2-web-app/frontend/hooks/useTasks.ts (fetch tasks, create task, loading/error states)

### Frontend - Dashboard Page

- [ ] T074 [US2] Create dashboard page in phase-2-web-app/frontend/app/dashboard/page.tsx (fetch tasks with useTasks, display TaskList, show TaskForm)
- [ ] T075 [US2] Add dashboard layout in phase-2-web-app/frontend/app/dashboard/layout.tsx (header with user name, logout button)

### Backend Tests

- [ ] T076 [P] [US2] Write tests for TaskService.get_tasks in phase-2-web-app/backend/tests/test_task_service.py (returns user's tasks only, ordered correctly)
- [ ] T077 [P] [US2] Write tests for TaskService.create_task in phase-2-web-app/backend/tests/test_task_service.py (creates task, validates title, rejects empty title)
- [ ] T078 [P] [US2] Write tests for GET /api/{user_id}/tasks in phase-2-web-app/backend/tests/test_tasks.py (success 200, data isolation verified, unauthorized 401, forbidden 403)
- [ ] T079 [P] [US2] Write tests for POST /api/{user_id}/tasks in phase-2-web-app/backend/tests/test_tasks.py (success 201, validation 400, unauthorized 401, forbidden 403)

### Frontend Tests

- [ ] T080 [P] [US2] Write tests for TaskList component in phase-2-web-app/frontend/tests/components/TaskList.test.tsx (renders tasks, shows empty state)
- [ ] T081 [P] [US2] Write tests for TaskForm component in phase-2-web-app/frontend/tests/components/TaskForm.test.tsx (submits data, validates title required)

**Completion Criteria**:
- ✅ Authenticated user can create task with title and description
- ✅ Authenticated user can create task with title only (description optional)
- ✅ Created tasks appear in task list immediately
- ✅ Empty task list shows friendly message
- ✅ User only sees their own tasks (data isolation verified)
- ✅ Title validation rejects empty or >200 char titles
- ✅ Description validation rejects >1000 char descriptions
- ✅ Backend tests pass with ≥80% coverage
- ✅ Frontend tests pass with ≥70% coverage

---

## Phase 5: User Story 3 (P3) - Task Updates and Completion Tracking

**Goal**: Implement task editing and completion toggle

**User Story**: As an authenticated user, I want to mark tasks as complete/pending and update task details so that I can track my progress and keep my task information current.

**Independent Test**: Create task → Mark complete → Verify visual change → Toggle back to pending → Edit title → Edit description → Verify changes persist after refresh

**Dependencies**: Must complete Phase 3 (US1 - authentication), can run parallel to Phase 4 (US2)

**Tasks**:

### Backend - Task Service Updates

- [ ] T082 [US3] Implement update_task method in TaskService (validate ownership, update title/description, save)
- [ ] T083 [US3] Implement toggle_complete method in TaskService (validate ownership, flip completed boolean, update updated_at)

### Backend - Task Routes Updates

- [ ] T084 [US3] Implement PUT /api/{user_id}/tasks/{id} endpoint (call TaskService.update_task, verify ownership, return 200 or 403/404)
- [ ] T085 [US3] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint (call TaskService.toggle_complete, verify ownership, return 200)

### Frontend - Task Edit Components

- [ ] T086 [P] [US3] Create EditTaskForm component in phase-2-web-app/frontend/components/EditTaskForm.tsx (pre-filled form for editing task)
- [ ] T087 [P] [US3] Create Modal component in phase-2-web-app/frontend/components/ui/Modal.tsx (overlay for edit form)
- [ ] T088 [P] [US3] Add Edit button to TaskItem component in phase-2-web-app/frontend/components/TaskItem.tsx (opens modal with EditTaskForm)
- [ ] T089 [P] [US3] Add Complete checkbox to TaskItem component in phase-2-web-app/frontend/components/TaskItem.tsx (toggle on click, visual distinction for completed)

### Frontend - Task Management Hook Updates

- [ ] T090 [US3] Add updateTask method to useTasks hook in phase-2-web-app/frontend/hooks/useTasks.ts (call PUT endpoint, update local state)
- [ ] T091 [US3] Add toggleComplete method to useTasks hook in phase-2-web-app/frontend/hooks/useTasks.ts (call PATCH endpoint, update local state)

### Backend Tests

- [ ] T092 [P] [US3] Write tests for TaskService.update_task in phase-2-web-app/backend/tests/test_task_service.py (updates successfully, validates ownership, rejects invalid data)
- [ ] T093 [P] [US3] Write tests for TaskService.toggle_complete in phase-2-web-app/backend/tests/test_task_service.py (toggles completed, validates ownership)
- [ ] T094 [P] [US3] Write tests for PUT /api/{user_id}/tasks/{id} in phase-2-web-app/backend/tests/test_tasks.py (success 200, not found 404, forbidden 403, validation 400)
- [ ] T095 [P] [US3] Write tests for PATCH /api/{user_id}/tasks/{id}/complete in phase-2-web-app/backend/tests/test_tasks.py (success 200, not found 404, forbidden 403)

### Frontend Tests

- [ ] T096 [P] [US3] Write tests for EditTaskForm component in phase-2-web-app/frontend/tests/components/EditTaskForm.test.tsx (renders with pre-filled data, submits updates)
- [ ] T097 [P] [US3] Write tests for Modal component in phase-2-web-app/frontend/tests/components/ui/Modal.test.tsx (opens, closes, renders children)

**Completion Criteria**:
- ✅ User can mark task as complete (checkbox toggle)
- ✅ Completed tasks visually distinguished (strikethrough, different color)
- ✅ User can toggle task back to pending
- ✅ User can edit task title via edit button
- ✅ User can edit task description via edit button
- ✅ Changes persist after page refresh (database-backed)
- ✅ User cannot update another user's task (403 Forbidden)
- ✅ Backend tests pass with ≥80% coverage
- ✅ Frontend tests pass with ≥70% coverage

---

## Phase 6: User Story 4 (P4) - Task Deletion

**Goal**: Implement task deletion with confirmation

**User Story**: As an authenticated user, I want to delete tasks I no longer need so that my task list remains relevant and uncluttered.

**Independent Test**: Create task → Delete with confirmation → Verify removed from list → Verify persists after refresh → Test cancel confirmation

**Dependencies**: Must complete Phase 3 (US1 - authentication), can run parallel to Phase 4 (US2) and Phase 5 (US3)

**Tasks**:

### Backend - Task Service Deletion

- [ ] T098 [US4] Implement delete_task method in TaskService (validate ownership, delete from database)

### Backend - Task Routes Deletion

- [ ] T099 [US4] Implement DELETE /api/{user_id}/tasks/{id} endpoint (call TaskService.delete_task, verify ownership, return 204 or 403/404)

### Frontend - Delete Components

- [ ] T100 [P] [US4] Create DeleteConfirmModal component in phase-2-web-app/frontend/components/DeleteConfirmModal.tsx (confirmation dialog with Cancel/Delete buttons)
- [ ] T101 [P] [US4] Add Delete button to TaskItem component in phase-2-web-app/frontend/components/TaskItem.tsx (opens DeleteConfirmModal)

### Frontend - Task Management Hook Deletion

- [ ] T102 [US4] Add deleteTask method to useTasks hook in phase-2-web-app/frontend/hooks/useTasks.ts (call DELETE endpoint, remove from local state)

### Backend Tests

- [ ] T103 [P] [US4] Write tests for TaskService.delete_task in phase-2-web-app/backend/tests/test_task_service.py (deletes successfully, validates ownership, handles not found)
- [ ] T104 [P] [US4] Write tests for DELETE /api/{user_id}/tasks/{id} in phase-2-web-app/backend/tests/test_tasks.py (success 204, not found 404, forbidden 403)

### Frontend Tests

- [ ] T105 [P] [US4] Write tests for DeleteConfirmModal component in phase-2-web-app/frontend/tests/components/DeleteConfirmModal.test.tsx (renders, calls onConfirm, calls onCancel)

**Completion Criteria**:
- ✅ User can click delete button on task
- ✅ Confirmation modal appears before deletion
- ✅ User can cancel deletion (task remains)
- ✅ User can confirm deletion (task removed from list)
- ✅ Deleted task does not reappear after refresh
- ✅ User cannot delete another user's task (403 Forbidden)
- ✅ Backend tests pass with ≥80% coverage
- ✅ Frontend tests pass with ≥70% coverage

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Improve UX, error handling, responsive design, and prepare for deployment

**Dependencies**: Complete all user story phases (Phase 3-6)

**Tasks**:

### Error Handling

- [ ] T106 [P] Create error handling utilities in phase-2-web-app/backend/src/utils/errors.py (custom exception classes, error response formatter)
- [ ] T107 [P] Create global error handler in phase-2-web-app/backend/src/main.py (catch all exceptions, return formatted JSON errors)
- [ ] T108 [P] Create ErrorBoundary component in phase-2-web-app/frontend/components/ErrorBoundary.tsx (catch React errors, display fallback UI)
- [ ] T109 [P] Create toast notification system in phase-2-web-app/frontend/components/Toast.tsx (success/error messages)

### Loading States

- [ ] T110 [P] Add loading spinners to all async operations in TaskForm, EditTaskForm, DeleteConfirmModal components
- [ ] T111 [P] Create LoadingSpinner component in phase-2-web-app/frontend/components/ui/LoadingSpinner.tsx (Tailwind animated spinner)
- [ ] T112 [P] Add skeleton loaders for TaskList in phase-2-web-app/frontend/components/TaskList.tsx (loading state while fetching)

### Responsive Design

- [ ] T113 [P] Test and fix mobile layout (<768px) for all pages in phase-2-web-app/frontend/
- [ ] T114 [P] Test and fix tablet layout (768px-1024px) for all pages in phase-2-web-app/frontend/
- [ ] T115 [P] Add responsive breakpoints to Tailwind config in phase-2-web-app/frontend/tailwind.config.ts

### Code Quality

- [ ] T116 [P] Run ruff format on all backend files in phase-2-web-app/backend/src/ and phase-2-web-app/backend/tests/
- [ ] T117 [P] Run ruff check on all backend files and fix issues in phase-2-web-app/backend/
- [ ] T118 [P] Run mypy --strict on backend and fix type errors in phase-2-web-app/backend/src/
- [ ] T119 [P] Run ESLint on frontend and fix issues in phase-2-web-app/frontend/
- [ ] T120 [P] Run Prettier on frontend files in phase-2-web-app/frontend/

### Testing Coverage

- [ ] T121 Run backend test coverage report and ensure ≥80% in phase-2-web-app/backend/
- [ ] T122 Run frontend test coverage report and ensure ≥70% in phase-2-web-app/frontend/
- [ ] T123 [P] Write integration tests for full auth flow (signup → login → logout) in phase-2-web-app/backend/tests/test_integration.py
- [ ] T124 [P] Write integration tests for full task flow (create → view → update → delete) in phase-2-web-app/backend/tests/test_integration.py

### Documentation

- [ ] T125 [P] Update main README.md with Phase II setup instructions in phase-2-web-app/
- [ ] T126 [P] Document all API endpoints in backend README.md in phase-2-web-app/backend/
- [ ] T127 [P] Document all components in frontend README.md in phase-2-web-app/frontend/
- [ ] T128 [P] Create API documentation using FastAPI Swagger UI (already available at /docs)

### Deployment Configuration

- [ ] T129 [P] Create Dockerfile for backend in phase-2-web-app/backend/Dockerfile (multi-stage build, non-root user)
- [ ] T130 [P] Configure vercel.json for frontend deployment in phase-2-web-app/frontend/vercel.json
- [ ] T131 [P] Create GitHub Actions CI workflow in .github/workflows/backend-ci.yml (lint, test, build)
- [ ] T132 [P] Create GitHub Actions CI workflow in .github/workflows/frontend-ci.yml (lint, test, build)
- [ ] T133 Create deployment guide in phase-2-web-app/DEPLOYMENT.md (Vercel + Railway/Render instructions)

### Bonus Features (Optional)

- [ ] T134 [P] [BONUS] Create reusable web app blueprint skill based on Phase II architecture
- [ ] T135 [P] [BONUS] Document Phase II patterns as reusable intelligence for future phases
- [ ] T136 [P] [BONUS] Add Urdu language support to frontend (i18n with next-intl)
- [ ] T137 [P] [BONUS] Add voice command support using Web Speech API

**Completion Criteria**:
- ✅ All errors display user-friendly messages (no stack traces in UI)
- ✅ All async operations show loading indicators
- ✅ Application fully responsive on mobile, tablet, desktop
- ✅ All linters pass (ruff, ESLint, mypy, TypeScript)
- ✅ Backend test coverage ≥80%
- ✅ Frontend test coverage ≥70%
- ✅ README files complete with setup instructions
- ✅ Deployment configurations ready for Vercel + Railway/Render
- ✅ CI/CD pipelines configured

---

## Parallel Execution Examples

**Phase 1 (Setup)**:
- Run T002-T014 in parallel (all independent project initialization tasks)

**Phase 2 (Foundational)**:
- Run T021-T027 in parallel (models, schemas, utilities - independent)
- Run T031-T034 in parallel (frontend utilities - independent)

**Phase 3 (US1 - Authentication)**:
- Run T045-T049 in parallel (frontend components - independent)
- Run T055-T061 in parallel (all tests - independent)

**Phase 4 (US2 - Task CRUD)**:
- Run T069-T072 in parallel (frontend components - independent)
- Run T076-T081 in parallel (all tests - independent)

**Phase 5 (US3 - Updates)**:
- Run T086-T089 in parallel (frontend components - independent)
- Run T092-T097 in parallel (all tests - independent)

**Phase 6 (US4 - Deletion)**:
- Run T100-T101 in parallel (frontend components - independent)
- Run T103-T105 in parallel (all tests - independent)

**Phase 7 (Polish)**:
- Run T106-T120 in parallel (all polish tasks - independent)
- Run T129-T137 in parallel (deployment and bonus - independent)

---

## Implementation Strategy

### MVP Delivery (Minimum Viable Product)

**Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1)
**Goal**: Authentication working, users can signup/login
**Deliverable**: Authenticated access to empty dashboard
**Timeline**: Complete first for early validation

### Incremental Delivery

1. **Week 1**: Phase 1 + Phase 2 + Phase 3 (US1) - Authentication MVP
2. **Week 2**: Phase 4 (US2) - Task creation and viewing
3. **Week 3**: Phase 5 (US3) + Phase 6 (US4) - Updates and deletion
4. **Week 4**: Phase 7 - Polish, testing, deployment

### Testing Strategy

- **TDD Approach**: Write tests before implementation (T055-T061, T076-T081, etc.)
- **Continuous Testing**: Run tests after each task completion
- **Coverage Monitoring**: Track coverage after each phase
- **Integration Testing**: Test full flows after each user story complete

### Quality Gates

- **After Each User Story Phase**: Run all tests, verify acceptance criteria
- **Before Polish Phase**: Ensure all user stories independently testable
- **Before Deployment**: Run full test suite, verify coverage targets

---

## Task Summary

**Total Tasks**: 137
**Setup Phase**: 18 tasks
**Foundational Phase**: 16 tasks
**User Story 1 (P1)**: 27 tasks
**User Story 2 (P2)**: 20 tasks
**User Story 3 (P3)**: 16 tasks
**User Story 4 (P4)**: 8 tasks
**Polish Phase**: 32 tasks

**Parallel Opportunities**: 85+ tasks marked with [P]
**Test Tasks**: 35 tasks

**Format Validation**: ✅ All tasks follow checklist format (checkbox, ID, labels, file paths)

---

**Ready for Implementation**: ✅ All tasks defined with clear acceptance criteria and file paths

**Next Step**: Run `/sp.implement` to begin task-by-task execution
