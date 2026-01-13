"""
Tests for advanced task features: filtering, sorting, stats, export.

These tests cover bonus features that increase test coverage.
"""
import pytest
from httpx import AsyncClient


@pytest.fixture
async def authenticated_client(client: AsyncClient, sample_user_data):
    """Create client with authentication token."""
    signup_response = await client.post("/auth/signup", json=sample_user_data)
    token = signup_response.json()["access_token"]

    class AuthClient:
        def __init__(self, client, token):
            self.client = client
            self.token = token
            self.headers = {"Authorization": f"Bearer {token}"}

        async def get(self, *args, **kwargs):
            kwargs.setdefault("headers", {}).update(self.headers)
            return await self.client.get(*args, **kwargs)

        async def post(self, *args, **kwargs):
            kwargs.setdefault("headers", {}).update(self.headers)
            return await self.client.post(*args, **kwargs)

        async def patch(self, *args, **kwargs):
            kwargs.setdefault("headers", {}).update(self.headers)
            return await self.client.patch(*args, **kwargs)

        async def delete(self, *args, **kwargs):
            kwargs.setdefault("headers", {}).update(self.headers)
            return await self.client.delete(*args, **kwargs)

    return AuthClient(client, token)


class TestTaskFiltering:
    """Test task filtering functionality."""

    @pytest.mark.asyncio
    async def test_filter_by_completed_status(self, authenticated_client):
        """
        Given: Mix of completed and pending tasks
        When: GET /tasks?completed=true
        Then: Should return only completed tasks
        """
        # Create tasks
        await authenticated_client.post("/tasks", json={"title": "Task 1", "completed": False})
        response2 = await authenticated_client.post("/tasks", json={"title": "Task 2", "completed": False})
        task2_id = response2.json()["id"]

        # Mark one complete
        await authenticated_client.patch(f"/tasks/{task2_id}", json={"completed": True})

        # Filter by completed
        response = await authenticated_client.get("/tasks?completed=true")

        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 1
        assert tasks[0]["title"] == "Task 2"
        assert tasks[0]["completed"] is True

    @pytest.mark.asyncio
    async def test_filter_by_pending_status(self, authenticated_client):
        """
        Given: Mix of completed and pending tasks
        When: GET /tasks?completed=false
        Then: Should return only pending tasks
        """
        # Create tasks
        await authenticated_client.post("/tasks", json={"title": "Task 1", "completed": False})
        response2 = await authenticated_client.post("/tasks", json={"title": "Task 2", "completed": False})
        task2_id = response2.json()["id"]

        # Mark one complete
        await authenticated_client.patch(f"/tasks/{task2_id}", json={"completed": True})

        # Filter by pending
        response = await authenticated_client.get("/tasks?completed=false")

        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 1
        assert tasks[0]["title"] == "Task 1"
        assert tasks[0]["completed"] is False

    @pytest.mark.asyncio
    async def test_filter_by_category(self, authenticated_client):
        """
        Given: Tasks with different categories
        When: GET /tasks?category=Work
        Then: Should return only Work tasks
        """
        await authenticated_client.post("/tasks", json={"title": "Work Task", "category": "Work"})
        await authenticated_client.post("/tasks", json={"title": "Personal Task", "category": "Personal"})

        response = await authenticated_client.get("/tasks?category=Work")

        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 1
        assert tasks[0]["category"] == "Work"

    @pytest.mark.asyncio
    async def test_search_tasks_by_title(self, authenticated_client):
        """
        Given: Multiple tasks
        When: GET /tasks?search=important
        Then: Should return tasks matching search query
        """
        await authenticated_client.post("/tasks", json={"title": "Important meeting"})
        await authenticated_client.post("/tasks", json={"title": "Regular task"})

        response = await authenticated_client.get("/tasks?search=important")

        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 1
        assert "Important" in tasks[0]["title"]


class TestTaskSorting:
    """Test task sorting functionality."""

    @pytest.mark.asyncio
    async def test_sort_by_created_at(self, authenticated_client):
        """
        Given: Multiple tasks created at different times
        When: GET /tasks?sort_by=created_at
        Then: Should return tasks newest first
        """
        await authenticated_client.post("/tasks", json={"title": "First Task"})
        await authenticated_client.post("/tasks", json={"title": "Second Task"})
        await authenticated_client.post("/tasks", json={"title": "Third Task"})

        response = await authenticated_client.get("/tasks?sort_by=created_at")

        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 3
        # Newest first
        assert tasks[0]["title"] == "Third Task"
        assert tasks[2]["title"] == "First Task"


class TestErrorHandling:
    """Test error handling and edge cases."""

    @pytest.mark.asyncio
    async def test_get_task_with_invalid_id_returns_404(self, authenticated_client):
        """
        Given: Invalid task ID
        When: GET /tasks/99999
        Then: Should return 404
        """
        response = await authenticated_client.get("/tasks/99999")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_update_task_with_invalid_data(self, authenticated_client):
        """
        Given: Existing task
        When: PATCH with invalid priority
        Then: Should return 400 or 422
        """
        response1 = await authenticated_client.post("/tasks", json={"title": "Task"})
        task_id = response1.json()["id"]

        response = await authenticated_client.patch(
            f"/tasks/{task_id}",
            json={"priority": "invalid_priority"}
        )

        assert response.status_code in [400, 422]

    @pytest.mark.asyncio
    async def test_create_task_with_missing_required_fields(self, authenticated_client):
        """
        Given: Request without title
        When: POST /tasks
        Then: Should return 422
        """
        response = await authenticated_client.post("/tasks", json={})

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_unauthenticated_request_fails(self, client):
        """
        Given: No authentication token
        When: GET /tasks
        Then: Should return 401
        """
        response = await client.get("/tasks")

        assert response.status_code == 401


class TestValidators:
    """Test validation utility functions."""

    @pytest.mark.asyncio
    async def test_create_task_with_empty_title_fails(self, authenticated_client):
        """
        Given: Empty title
        When: POST /tasks with empty title
        Then: Should return 400 validation error
        """
        response = await authenticated_client.post("/tasks", json={"title": ""})

        assert response.status_code == 400 or response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_task_with_long_title_fails(self, authenticated_client):
        """
        Given: Title exceeds 200 characters
        When: POST /tasks
        Then: Should return 400 validation error
        """
        long_title = "a" * 201
        response = await authenticated_client.post("/tasks", json={"title": long_title})

        assert response.status_code == 400 or response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_task_with_long_description_fails(self, authenticated_client):
        """
        Given: Description exceeds 1000 characters
        When: POST /tasks
        Then: Should return 400 validation error
        """
        long_desc = "a" * 1001
        response = await authenticated_client.post("/tasks", json={
            "title": "Valid Title",
            "description": long_desc
        })

        assert response.status_code == 400 or response.status_code == 422
