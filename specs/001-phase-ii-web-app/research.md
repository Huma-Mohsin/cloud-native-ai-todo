# Phase 0: Research & Technical Decisions

**Feature**: Phase II Full-Stack Web Todo Application
**Date**: 2025-12-31
**Status**: Complete

## Overview

This document captures technical research and architectural decisions made during the planning phase. All decisions are based on constitution requirements, industry best practices, and the specific needs of a multi-user web todo application.

---

## Decision 1: Better Auth + Next.js 16+ App Router Integration

### Context
Need to integrate Better Auth with JWT plugin into Next.js 16+ using the new App Router architecture (not Pages Router).

### Decision
Use Better Auth client-side configuration with JWT tokens stored in httpOnly cookies for maximum security. Configure Better Auth in `lib/auth.ts` with the following approach:

**Implementation Strategy**:
- **Client Setup**: Create `lib/auth.ts` with Better Auth client configuration
- **JWT Plugin**: Enable JWT plugin in Better Auth config
- **Token Storage**: httpOnly cookies (prevents XSS attacks)
- **Auth Context**: Create React Context to share auth state across components
- **Server Actions**: Use Next.js Server Actions for signup/login (server-side only)
- **Middleware**: Next.js middleware to protect routes and redirect unauthenticated users

### Rationale
- **httpOnly Cookies**: More secure than localStorage (prevents XSS token theft)
- **Server Actions**: Keeps credentials server-side, never exposed to client
- **App Router Compatible**: Leverages new Next.js patterns (Server Components, Server Actions)
- **Constitution Compliant**: Uses Better Auth as mandated

### Alternatives Considered
1. **NextAuth.js**: Not chosen because constitution explicitly requires Better Auth
2. **localStorage for JWT**: Rejected due to XSS vulnerability
3. **Session-based auth**: Rejected because constitution requires JWT tokens

### Implementation Notes
```typescript
// lib/auth.ts (simplified structure)
import { createAuthClient } from "better-auth/client"
export const authClient = createAuthClient({
  plugins: [jwtPlugin()],
  // ...config
})
```

---

## Decision 2: FastAPI + Better Auth JWT Verification

### Context
Backend FastAPI needs to verify JWT tokens issued by Better Auth frontend to authenticate API requests.

### Decision
Create custom FastAPI middleware to verify JWT tokens using the same shared secret as Better Auth. Extract user_id from token payload and inject into request state.

**Implementation Strategy**:
- **Shared Secret**: `BETTER_AUTH_SECRET` environment variable used by both frontend and backend
- **JWT Library**: Use `python-jose` for JWT verification in FastAPI
- **Middleware**: Custom `AuthMiddleware` verifies token on all `/api/*` routes
- **Token Extraction**: Read token from `Authorization: Bearer <token>` header
- **User Context**: Store decoded user_id in `request.state.user_id` for route handlers
- **Error Handling**: Return 401 for missing/invalid tokens, 403 for user_id mismatch

### Rationale
- **Shared Secret**: Ensures frontend and backend can issue/verify same tokens
- **Middleware Pattern**: Centralizes auth logic, DRY principle
- **Bearer Token**: Industry-standard HTTP auth header
- **Constitution Compliant**: JWT-based as required

### Alternatives Considered
1. **OAuth2 with separate auth server**: Overcomplicated for Phase II MVP
2. **Session cookies**: Constitution requires JWT tokens
3. **API keys**: Less secure than JWT for user authentication

### Implementation Notes
```python
# middleware/auth.py (simplified structure)
from jose import jwt, JWTError
async def verify_jwt(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    payload = jwt.decode(token, SECRET, algorithms=["HS256"])
    request.state.user_id = payload["user_id"]
```

---

## Decision 3: Neon Serverless PostgreSQL Connection Pooling

### Context
Neon Serverless PostgreSQL requires special connection handling. FastAPI apps need connection pooling to avoid exhausting database connections.

### Decision
Use SQLModel's async engine with connection pooling configured for Neon's serverless architecture. Implement dependency injection pattern for database sessions.

**Implementation Strategy**:
- **Async Engine**: `create_async_engine` from SQLAlchemy (SQLModel uses it)
- **Pool Size**: `pool_size=10, max_overflow=20` (conservative for serverless)
- **Pool Recycle**: `pool_recycle=3600` (1 hour, prevents stale connections)
- **Dependency Injection**: FastAPI `Depends()` for session management
- **Auto-commit**: Use `session.commit()` explicitly (no auto-commit)
- **Connection String**: `postgresql+asyncpg://user:pass@host/db` (asyncpg driver)

### Rationale
- **Async**: FastAPI is async, requires async database driver
- **Connection Pooling**: Reuses connections, reduces latency
- **Pool Recycle**: Serverless databases may close idle connections
- **Dependency Injection**: FastAPI best practice, automatic session cleanup

### Alternatives Considered
1. **Sync SQLModel**: Rejected because FastAPI is async
2. **No connection pooling**: Rejected due to performance issues
3. **Prisma ORM**: Rejected because constitution requires SQLModel

### Implementation Notes
```python
# database.py (simplified structure)
from sqlmodel import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
)

async def get_session():
    async with AsyncSession(engine) as session:
        yield session
```

---

## Decision 4: Next.js Server Components vs Client Components

### Context
Next.js 16+ App Router defaults to Server Components. Need to determine when to use Server Components vs Client Components for task management UI.

### Decision
Use Server Components by default for data fetching and layout, use Client Components only when interactivity (onClick, useState, useEffect) is required.

**Component Classification**:

**Server Components** (default, no 'use client'):
- `app/layout.tsx` - Root layout
- `app/dashboard/layout.tsx` - Dashboard layout
- Task list fetching logic (initial server render)

**Client Components** ('use client' directive):
- `components/TaskForm.tsx` - Form with useState for input
- `components/TaskItem.tsx` - Toggle complete button with onClick
- `components/DeleteConfirm.tsx` - Modal with state management
- `components/AuthForm.tsx` - Login/signup forms with validation
- `hooks/useAuth.ts` - Client-side auth state hook
- `hooks/useTasks.ts` - Client-side task mutations hook

### Rationale
- **Server Components**: Faster initial page load, smaller JS bundle, SEO-friendly
- **Client Components**: Required for interactivity (buttons, forms, modals)
- **Hybrid Approach**: Optimal performance (server for data, client for UI)
- **Constitution Compliant**: Leverages Next.js 16+ App Router features

### Alternatives Considered
1. **All Client Components**: Rejected due to larger bundle size, slower page loads
2. **All Server Components**: Impossible - interactivity requires client JS
3. **Pages Router**: Rejected because constitution requires App Router

### Implementation Pattern
```tsx
// Server Component (no directive, default)
export default async function TasksPage() {
  const tasks = await fetchTasks() // Server-side fetch
  return <TaskList initialTasks={tasks} /> // Pass to client component
}

// Client Component (explicit directive)
'use client'
export function TaskList({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks)
  return <div>{/* interactive UI */}</div>
}
```

---

## Decision 5: Environment Variable Management Across Deployments

### Context
Frontend (Vercel) and backend (Railway/Render) need to share the same JWT secret for token verification. Other secrets (DATABASE_URL, API URLs) are deployment-specific.

### Decision
Use environment variable management strategy with shared and deployment-specific secrets:

**Shared Secrets** (must be identical):
- `BETTER_AUTH_SECRET` - JWT signing/verification key (32+ random chars)
- Generated once, manually copied to both Vercel and Railway/Render

**Frontend-Specific** (Vercel):
- `NEXT_PUBLIC_API_URL` - Backend API base URL (public, exposed to browser)
- `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` - For future Phase III (OpenAI ChatKit)

**Backend-Specific** (Railway/Render):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `CORS_ORIGINS` - Allowed frontend origin (Vercel deployment URL)

**Local Development**:
- `.env.local` (frontend) and `.env` (backend) with localhost values
- `.env.example` files committed to git (no actual secrets)

### Rationale
- **Shared Secret**: Required for JWT verification to work across services
- **Public Prefix**: Next.js `NEXT_PUBLIC_*` convention exposes vars to browser
- **CORS Origins**: Security - only allow requests from deployed frontend
- **Example Files**: Helps team members set up local environment

### Alternatives Considered
1. **Secrets in code**: Rejected - violates constitution security requirements
2. **Single deployment**: Rejected - constitution requires separate frontend/backend deploys
3. **Secret rotation service**: Overkill for Phase II MVP, consider for Phase V

### Implementation Checklist
- [ ] Generate BETTER_AUTH_SECRET (use `openssl rand -hex 32`)
- [ ] Add to Vercel environment variables
- [ ] Add to Railway/Render environment variables
- [ ] Create .env.example files for both frontend and backend
- [ ] Document in quickstart.md

---

## Summary

All technical decisions documented. Key takeaways:

1. **Authentication**: Better Auth with httpOnly cookies, JWT verification in FastAPI
2. **Database**: Async SQLModel with connection pooling for Neon Serverless
3. **Rendering**: Server Components by default, Client Components for interactivity
4. **Environment**: Shared JWT secret across deployments, deployment-specific configs

**Status**: ✅ Research complete, ready for Phase 1 design (data model, contracts, quickstart)

**Next Steps**:
- Create data-model.md
- Generate OpenAPI contract (contracts/openapi.yaml)
- Generate TypeScript types (contracts/types.ts)
- Write quickstart.md
