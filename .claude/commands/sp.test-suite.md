---
description: Generate comprehensive test suites including unit tests, integration tests, E2E tests, and CI/CD test pipelines for full-stack applications
handoffs:
  - label: Run Tests
    agent: general-purpose
    prompt: Run the generated test suite
    send: false
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

This skill automates test suite generation for your application. It creates:
- **Unit Tests**: Backend (pytest) and Frontend (Jest/Vitest)
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: User workflows with Playwright/Cypress
- **Load Tests**: Performance testing with Locust/k6
- **Test Fixtures**: Mock data and test utilities
- **CI/CD Integration**: Automated test pipelines

Comprehensive testing ensures code quality, catches bugs early, and impresses judges with engineering maturity.

## Outline

### 1. Setup and Context Loading

- Run `.specify/scripts/bash/check-prerequisites.sh --json --include-spec --include-plan` from repo root
- Parse FEATURE_DIR, FEATURE_SPEC, IMPL_PLAN paths
- Read plan.md to understand:
  - Tech stack (Python/FastAPI, Next.js, databases)
  - API endpoints and routes
  - Data models and business logic
  - External dependencies (databases, APIs, message queues)
- Read data-model.md to understand entities and relationships
- Read contracts/ (if exists) for API specifications

### 2. Analyze Testing Requirements

Extract from plan and spec:

**Backend Testing Needs**:
- Unit tests for models, services, utilities
- Integration tests for API endpoints
- Database tests (CRUD operations)
- Authentication/authorization tests
- MCP tool tests (Phase III)
- Event producer/consumer tests (Phase V)

**Frontend Testing Needs**:
- Component unit tests
- Integration tests (API calls)
- E2E tests (user workflows)
- Accessibility tests
- Performance tests

**Test Coverage Goals**:
- Unit tests: 80%+ coverage
- Integration tests: All API endpoints
- E2E tests: Critical user paths
- Load tests: Performance benchmarks

### 3. Generate Backend Test Structure

Create test directory structure:

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Pytest configuration and fixtures
│   ├── unit/
│   │   ├── __init__.py
│   │   ├── test_models.py       # Model tests
│   │   ├── test_services.py     # Business logic tests
│   │   └── test_utils.py        # Utility function tests
│   ├── integration/
│   │   ├── __init__.py
│   │   ├── test_api_tasks.py    # Task API tests
│   │   ├── test_api_auth.py     # Auth API tests
│   │   ├── test_database.py     # Database tests
│   │   └── test_mcp_tools.py    # MCP tool tests (Phase III)
│   ├── e2e/
│   │   ├── __init__.py
│   │   └── test_workflows.py    # End-to-end workflows
│   ├── load/
│   │   ├── locustfile.py        # Load testing scenarios
│   │   └── k6_script.js         # Alternative k6 tests
│   └── fixtures/
│       ├── __init__.py
│       ├── sample_data.py       # Test data
│       └── mock_responses.py    # Mock API responses
├── pytest.ini                   # Pytest configuration
└── .coveragerc                  # Coverage configuration
```

### 4. Generate Backend Test Files

**conftest.py** (Pytest fixtures):
```python
"""Pytest configuration and shared fixtures"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
from main import app
from db import get_session
import os

# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(name="engine")
def engine_fixture():
    """Create test database engine"""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="session")
def session_fixture(engine):
    """Create test database session"""
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create test client with database session override"""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="test_user")
def test_user_fixture(session: Session):
    """Create a test user"""
    from models import User
    user = User(
        id="test_user_123",
        email="test@example.com",
        name="Test User"
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture(name="auth_headers")
def auth_headers_fixture(test_user):
    """Generate authentication headers for test user"""
    # Generate JWT token for test user
    from auth import create_access_token
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(name="sample_task")
def sample_task_fixture(session: Session, test_user):
    """Create a sample task for testing"""
    from models import Task
    task = Task(
        user_id=test_user.id,
        title="Test Task",
        description="Test Description",
        completed=False
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
```

**tests/unit/test_models.py**:
```python
"""Unit tests for database models"""
import pytest
from models import Task, User
from datetime import datetime

def test_task_creation(session):
    """Test creating a task"""
    task = Task(
        user_id="user_123",
        title="Buy groceries",
        description="Milk, eggs, bread",
        completed=False
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    assert task.id is not None
    assert task.title == "Buy groceries"
    assert task.completed is False
    assert task.created_at is not None

def test_task_completion(session):
    """Test marking task as complete"""
    task = Task(
        user_id="user_123",
        title="Test task",
        completed=False
    )
    session.add(task)
    session.commit()

    task.completed = True
    session.add(task)
    session.commit()
    session.refresh(task)

    assert task.completed is True

def test_task_validation():
    """Test task validation rules"""
    # Title is required
    with pytest.raises(ValueError):
        Task(user_id="user_123", title="", completed=False)

    # Title max length
    with pytest.raises(ValueError):
        Task(user_id="user_123", title="x" * 201, completed=False)
```

**tests/integration/test_api_tasks.py**:
```python
"""Integration tests for task API endpoints"""
import pytest
from fastapi.testclient import TestClient

def test_create_task(client: TestClient, auth_headers):
    """Test POST /api/tasks - Create a new task"""
    response = client.post(
        "/api/tasks",
        json={
            "title": "Buy groceries",
            "description": "Milk, eggs, bread"
        },
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy groceries"
    assert data["completed"] is False
    assert "id" in data

def test_list_tasks(client: TestClient, auth_headers, sample_task):
    """Test GET /api/tasks - List all tasks"""
    response = client.get("/api/tasks", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["title"] == sample_task.title

def test_get_task(client: TestClient, auth_headers, sample_task):
    """Test GET /api/tasks/{id} - Get task details"""
    response = client.get(
        f"/api/tasks/{sample_task.id}",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_task.id
    assert data["title"] == sample_task.title

def test_update_task(client: TestClient, auth_headers, sample_task):
    """Test PUT /api/tasks/{id} - Update a task"""
    response = client.put(
        f"/api/tasks/{sample_task.id}",
        json={"title": "Updated Title"},
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"

def test_complete_task(client: TestClient, auth_headers, sample_task):
    """Test PATCH /api/tasks/{id}/complete - Mark task complete"""
    response = client.patch(
        f"/api/tasks/{sample_task.id}/complete",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True

def test_delete_task(client: TestClient, auth_headers, sample_task):
    """Test DELETE /api/tasks/{id} - Delete a task"""
    response = client.delete(
        f"/api/tasks/{sample_task.id}",
        headers=auth_headers
    )

    assert response.status_code == 204

    # Verify task is deleted
    response = client.get(
        f"/api/tasks/{sample_task.id}",
        headers=auth_headers
    )
    assert response.status_code == 404

def test_unauthorized_access(client: TestClient):
    """Test API requires authentication"""
    response = client.get("/api/tasks")
    assert response.status_code == 401

def test_user_isolation(client: TestClient, session, test_user):
    """Test users can only access their own tasks"""
    from models import Task, User

    # Create another user
    other_user = User(id="other_user", email="other@example.com", name="Other")
    session.add(other_user)

    # Create task for other user
    other_task = Task(user_id=other_user.id, title="Other's task", completed=False)
    session.add(other_task)
    session.commit()

    # Test user tries to access other user's task
    from auth import create_access_token
    token = create_access_token(test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/tasks/{other_task.id}", headers=headers)
    assert response.status_code == 404  # Should not find other user's task
```

**tests/load/locustfile.py** (Load testing):
```python
"""Load testing scenarios with Locust"""
from locust import HttpUser, task, between
import random

class TodoUser(HttpUser):
    """Simulated user for load testing"""
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks

    def on_start(self):
        """Login and get auth token"""
        response = self.client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "testpass123"
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(3)
    def list_tasks(self):
        """List all tasks (most common operation)"""
        self.client.get("/api/tasks", headers=self.headers)

    @task(2)
    def create_task(self):
        """Create a new task"""
        self.client.post(
            "/api/tasks",
            json={
                "title": f"Task {random.randint(1, 1000)}",
                "description": "Load test task"
            },
            headers=self.headers
        )

    @task(1)
    def complete_task(self):
        """Mark a random task as complete"""
        # Get tasks first
        response = self.client.get("/api/tasks", headers=self.headers)
        tasks = response.json()

        if tasks:
            task_id = random.choice(tasks)["id"]
            self.client.patch(
                f"/api/tasks/{task_id}/complete",
                headers=self.headers
            )
```

### 5. Generate Frontend Test Structure

```
frontend/
├── __tests__/
│   ├── components/
│   │   ├── TaskList.test.tsx
│   │   ├── TaskForm.test.tsx
│   │   └── TaskItem.test.tsx
│   ├── pages/
│   │   ├── index.test.tsx
│   │   └── tasks.test.tsx
│   ├── api/
│   │   └── tasks.test.ts
│   └── e2e/
│       ├── task-creation.spec.ts
│       ├── task-completion.spec.ts
│       └── user-auth.spec.ts
├── jest.config.js
├── jest.setup.js
└── playwright.config.ts
```

### 6. Generate Frontend Test Files

**jest.config.js**:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
};
```

**__tests__/components/TaskList.test.tsx**:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import TaskList from '@/components/TaskList';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TaskList', () => {
  it('renders task list', async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    render(<TaskList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles empty task list', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
    });
  });
});
```

**__tests__/e2e/task-creation.spec.ts** (Playwright):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Task Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/tasks');
  });

  test('should create a new task', async ({ page }) => {
    // Click add task button
    await page.click('button:has-text("Add Task")');

    // Fill task form
    await page.fill('input[name="title"]', 'Buy groceries');
    await page.fill('textarea[name="description"]', 'Milk, eggs, bread');

    // Submit form
    await page.click('button:has-text("Create")');

    // Verify task appears in list
    await expect(page.locator('text=Buy groceries')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button:has-text("Add Task")');
    await page.click('button:has-text("Create")');

    // Should show validation error
    await expect(page.locator('text=Title is required')).toBeVisible();
  });

  test('should complete a task', async ({ page }) => {
    // Create a task first
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="title"]', 'Test task');
    await page.click('button:has-text("Create")');

    // Mark as complete
    await page.click('[data-testid="task-checkbox"]');

    // Verify task is marked complete
    await expect(page.locator('[data-testid="task-checkbox"]')).toBeChecked();
  });
});
```

### 7. Generate CI/CD Test Pipeline

**.github/workflows/test.yml**:
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio

      - name: Run unit tests
        run: |
          cd backend
          pytest tests/unit -v --cov=. --cov-report=xml

      - name: Run integration tests
        run: |
          cd backend
          pytest tests/integration -v

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run unit tests
        run: |
          cd frontend
          npm test -- --coverage

      - name: Run E2E tests
        run: |
          cd frontend
          npx playwright install --with-deps
          npm run test:e2e

  load-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'

      - name: Install Locust
        run: pip install locust

      - name: Run load tests
        run: |
          cd backend/tests/load
          locust -f locustfile.py --headless -u 100 -r 10 -t 60s --host=http://localhost:8000
```

### 8. Generate Test Documentation

**tests/README.md**:
```markdown
# Test Suite Documentation

## Overview

Comprehensive test suite covering:
- ✅ Unit tests (80%+ coverage)
- ✅ Integration tests (all API endpoints)
- ✅ E2E tests (critical user workflows)
- ✅ Load tests (performance benchmarks)

## Running Tests

### Backend Tests

```bash
# All tests
cd backend
pytest

# Unit tests only
pytest tests/unit -v

# Integration tests only
pytest tests/integration -v

# With coverage
pytest --cov=. --cov-report=html

# Specific test file
pytest tests/unit/test_models.py -v
```

### Frontend Tests

```bash
# All tests
cd frontend
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# E2E tests
npm run test:e2e
```

### Load Tests

```bash
# Run Locust load tests
cd backend/tests/load
locust -f locustfile.py

# Open browser to http://localhost:8089
```

## Test Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| Backend Unit | 80% | - |
| Backend Integration | 100% endpoints | - |
| Frontend Components | 70% | - |
| E2E Critical Paths | 100% | - |

## Writing New Tests

### Backend Unit Test Template

```python
def test_feature_name(session, test_user):
    """Test description"""
    # Arrange
    # ... setup test data

    # Act
    # ... perform action

    # Assert
    # ... verify results
    assert expected == actual
```

### Frontend Component Test Template

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## CI/CD Integration

Tests run automatically on:
- Every push to main/develop
- Every pull request
- Before deployment

Failed tests block deployment.
```

### 9. Output Summary

Generate completion report:
```markdown
# Test Suite Generation Complete ✅

## Generated Files

### Backend Tests
- ✅ tests/conftest.py (fixtures)
- ✅ tests/unit/test_models.py
- ✅ tests/unit/test_services.py
- ✅ tests/integration/test_api_tasks.py
- ✅ tests/integration/test_api_auth.py
- ✅ tests/integration/test_database.py
- ✅ tests/load/locustfile.py
- ✅ pytest.ini
- ✅ .coveragerc

### Frontend Tests
- ✅ __tests__/components/TaskList.test.tsx
- ✅ __tests__/components/TaskForm.test.tsx
- ✅ __tests__/e2e/task-creation.spec.ts
- ✅ __tests__/e2e/task-completion.spec.ts
- ✅ jest.config.js
- ✅ playwright.config.ts

### CI/CD
- ✅ .github/workflows/test.yml

### Documentation
- ✅ tests/README.md

## Test Coverage

- **Backend Unit Tests**: Models, services, utilities
- **Backend Integration Tests**: All API endpoints
- **Frontend Unit Tests**: Components, pages
- **E2E Tests**: User workflows
- **Load Tests**: Performance benchmarks

## Next Steps

1. **Install Test Dependencies**:
   ```bash
   # Backend
   pip install pytest pytest-cov pytest-asyncio

   # Frontend
   npm install --save-dev @testing-library/react @testing-library/jest-dom
   npm install --save-dev @playwright/test
   ```

2. **Run Tests**:
   ```bash
   # Backend
   cd backend && pytest

   # Frontend
   cd frontend && npm test
   ```

3. **Check Coverage**:
   ```bash
   pytest --cov=. --cov-report=html
   open htmlcov/index.html
   ```

4. **CI/CD**: Tests run automatically on push

## Benefits

✅ **Quality Assurance**: Catch bugs before production
✅ **Confidence**: Refactor safely with test coverage
✅ **Documentation**: Tests serve as usage examples
✅ **CI/CD**: Automated testing in pipeline
✅ **Impressive**: Shows engineering maturity to judges
```

## Key Rules

- **Test Isolation**: Each test should be independent
- **Fixtures**: Use pytest fixtures for reusable test data
- **Mocking**: Mock external dependencies (APIs, databases)
- **Coverage**: Aim for 80%+ unit test coverage
- **Fast Tests**: Unit tests should run in milliseconds
- **Descriptive Names**: Test names should describe what they test
- **AAA Pattern**: Arrange, Act, Assert

## Validation Checklist

Before completing, verify:
- [ ] Backend unit tests cover models and services
- [ ] Integration tests cover all API endpoints
- [ ] Frontend component tests use React Testing Library
- [ ] E2E tests cover critical user workflows
- [ ] Load tests simulate realistic traffic
- [ ] CI/CD pipeline runs all tests
- [ ] Test documentation is complete
- [ ] Coverage reports are generated

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: misc (for test suite generation)

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route: `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage misc --json`
   - Fill all placeholders

4) Validate + report
   - Verify no unresolved placeholders
   - Print ID + path + stage + title
