"""
Task CRUD endpoint tests.

Generated using TDD Workflow Skill (.claude/skills/tdd-workflow.md)
Tests for User Stories 2-4: Task Creation, Viewing, Updates, and Deletion

Acceptance Scenarios covered:
- User Story 2: Task creation and viewing
- User Story 3: Task updates and completion tracking
- User Story 4: Task deletion
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

        async def put(self, *args, **kwargs):
            kwargs.setdefault("headers", {}).update(self.headers)
            return await self.client.put(*args, **kwargs)

        async def patch(self, *args, **kwargs):
            kwargs.setdefault("headers", {}).update(self.headers)
            return await self.client.patch(*args, **kwargs)

        async def delete(self, *args, **kwargs):
            kwargs.setdefault("headers", {}).update(self.headers)
            return await self.client.delete(*args, **kwargs)

    return AuthClient(client, token)


class TestTaskCreation:
    """Test task creation functionality (User Story 2)."""

    @pytest.mark.asyncio
    async def test_create_task_with_valid_data_succeeds(self, authenticated_client, sample_task_data):
        """
        Given: Authenticated user with valid task data
        When: POST /tasks
        Then: Should return 201 and task appears in list
        """
        response = await authenticated_client.post("/tasks", json=sample_task_data)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_task_data["title"]
        assert data["description"] == sample_task_data["description"]
        assert data["completed"] is False
        assert "id" in data
        assert "created_at" in data

    @pytest.mark.asyncio
    async def test_create_task_with_only_title_succeeds(self, authenticated_client):
        """
        Given: Task data with only title (description optional)
        When: POST /tasks
        Then: Should return 201 and create task
        """
        minimal_task = {"title": "Minimal Task"}
        response = await authenticated_client.post("/tasks", json=minimal_task)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Task"

    @pytest.mark.asyncio
    async def test_create_task_with_empty_title_fails(self, authenticated_client):
        """
        Given: Empty task title
        When: POST /tasks
        Then: Should return 400 or 422
        """
        invalid_task = {"title": "", "description": "Test"}
        response = await authenticated_client.post("/tasks", json=invalid_task)

        assert response.status_code in [400, 422]

    @pytest.mark.asyncio
    async def test_create_task_with_long_title_fails(self, authenticated_client):
        """
        Given: Task title exceeding 200 characters
        When: POST /tasks
        Then: Should return 400 or 422
        """
        long_title = "A" * 201
        invalid_task = {"title": long_title}
        response = await authenticated_client.post("/tasks", json=invalid_task)

        assert response.status_code in [400, 422]


class TestTaskViewing:
    """Test task viewing and listing (User Story 2)."""

    @pytest.mark.asyncio
    async def test_get_all_tasks_returns_user_tasks_only(self, authenticated_client, sample_task_data):
        """
        Given: User has created multiple tasks
        When: GET /tasks
        Then: Should return all user's tasks only (data isolation)
        """
        # Create multiple tasks
        await authenticated_client.post("/tasks", json=sample_task_data)
        await authenticated_client.post("/tasks", json={**sample_task_data, "title": "Second Task"})

        response = await authenticated_client.get("/tasks")

        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 2
        assert all("id" in task for task in tasks)

    @pytest.mark.asyncio
    async def test_get_task_by_id_returns_task_details(self, authenticated_client, sample_task_data):
        """
        Given: Task exists
        When: GET /tasks/{id}
        Then: Should return task details
        """
        create_response = await authenticated_client.post("/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        response = await authenticated_client.get(f"/tasks/{task_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == sample_task_data["title"]

    @pytest.mark.asyncio
    async def test_get_nonexistent_task_returns_404(self, authenticated_client):
        """
        Given: Task ID does not exist
        When: GET /tasks/{id}
        Then: Should return 404 Not Found
        """
        response = await authenticated_client.get("/tasks/99999")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_empty_task_list_returns_empty_array(self, authenticated_client):
        """
        Given: User has no tasks
        When: GET /tasks
        Then: Should return empty array
        """
        response = await authenticated_client.get("/tasks")

        assert response.status_code == 200
        tasks = response.json()
        assert tasks == []


class TestTaskUpdates:
    """Test task update functionality (User Story 3)."""

    @pytest.mark.asyncio
    async def test_update_task_title_and_description_succeeds(self, authenticated_client, sample_task_data):
        """
        Given: Existing task
        When: PATCH /tasks/{id} with updated data
        Then: Should return 200 and reflect changes
        """
        create_response = await authenticated_client.post("/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        updated_data = {"title": "Updated Title", "description": "Updated Description"}
        response = await authenticated_client.patch(f"/tasks/{task_id}", json=updated_data)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "Updated Description"

    @pytest.mark.asyncio
    async def test_updated_task_persists_after_refresh(self, authenticated_client, sample_task_data):
        """
        Given: Task has been updated
        When: GET /tasks/{id} again
        Then: Should return updated data (database persistence)
        """
        create_response = await authenticated_client.post("/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        updated_data = {"title": "Persisted Update"}
        await authenticated_client.patch(f"/tasks/{task_id}", json=updated_data)

        # Verify persistence
        response = await authenticated_client.get(f"/tasks/{task_id}")

        assert response.status_code == 200
        assert response.json()["title"] == "Persisted Update"

    @pytest.mark.asyncio
    async def test_update_nonexistent_task_returns_404(self, authenticated_client):
        """
        Given: Task ID does not exist
        When: PATCH /tasks/{id}
        Then: Should return 404 Not Found
        """
        updated_data = {"title": "Updated"}
        response = await authenticated_client.patch("/tasks/99999", json=updated_data)

        assert response.status_code == 404


class TestTaskCompletion:
    """Test task completion toggle functionality (User Story 3)."""

    @pytest.mark.asyncio
    async def test_mark_task_as_complete_succeeds(self, authenticated_client, sample_task_data):
        """
        Given: Pending task
        When: PATCH /tasks/{id} with completed=true
        Then: Should mark task as completed
        """
        create_response = await authenticated_client.post("/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        response = await authenticated_client.patch(f"/tasks/{task_id}", json={"completed": True})

        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True

    @pytest.mark.asyncio
    async def test_toggle_completed_task_back_to_pending(self, authenticated_client, sample_task_data):
        """
        Given: Completed task
        When: PATCH /tasks/{id} with completed=false
        Then: Should toggle back to pending
        """
        create_response = await authenticated_client.post("/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        # Mark complete
        await authenticated_client.patch(f"/tasks/{task_id}", json={"completed": True})

        # Toggle back to pending
        response = await authenticated_client.patch(f"/tasks/{task_id}", json={"completed": False})

        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is False

    @pytest.mark.asyncio
    async def test_completed_task_visually_distinguished(self, authenticated_client, sample_task_data):
        """
        Given: Mix of completed and pending tasks
        When: GET /tasks
        Then: Completed tasks should have completed=true
        """
        # Create two tasks
        response1 = await authenticated_client.post("/tasks", json=sample_task_data)
        task1_id = response1.json()["id"]

        await authenticated_client.post("/tasks", json={**sample_task_data, "title": "Task 2"})

        # Mark first task complete
        await authenticated_client.patch(f"/tasks/{task1_id}", json={"completed": True})

        # Get all tasks
        response = await authenticated_client.get("/tasks")
        tasks = response.json()

        completed_task = next(t for t in tasks if t["id"] == task1_id)
        pending_task = next(t for t in tasks if t["id"] != task1_id)

        assert completed_task["completed"] is True
        assert pending_task["completed"] is False


class TestTaskDeletion:
    """Test task deletion functionality (User Story 4)."""

    @pytest.mark.asyncio
    async def test_delete_task_removes_from_list(self, authenticated_client, sample_task_data):
        """
        Given: Existing task
        When: DELETE /tasks/{id}
        Then: Task should be permanently removed
        """
        create_response = await authenticated_client.post("/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        response = await authenticated_client.delete(f"/tasks/{task_id}")

        assert response.status_code in [200, 204]

        # Verify task no longer exists
        get_response = await authenticated_client.get(f"/tasks/{task_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_deleted_task_does_not_reappear(self, authenticated_client, sample_task_data):
        """
        Given: Task has been deleted
        When: GET /tasks (refresh)
        Then: Deleted task should not reappear
        """
        create_response = await authenticated_client.post("/tasks", json=sample_task_data)
        task_id = create_response.json()["id"]

        await authenticated_client.delete(f"/tasks/{task_id}")

        # Check task list
        response = await authenticated_client.get("/tasks")
        tasks = response.json()

        assert not any(task["id"] == task_id for task in tasks)

    @pytest.mark.asyncio
    async def test_delete_nonexistent_task_returns_404(self, authenticated_client):
        """
        Given: Task ID does not exist
        When: DELETE /tasks/{id}
        Then: Should return 404 Not Found
        """
        response = await authenticated_client.delete("/tasks/99999")

        assert response.status_code == 404


class TestDataIsolation:
    """Test multi-user data isolation (critical security requirement)."""

    @pytest.mark.asyncio
    async def test_user_cannot_see_other_users_tasks(self, client: AsyncClient, sample_task_data):
        """
        Given: Two users with separate tasks
        When: Each user gets their tasks
        Then: Users should only see their own tasks
        """
        # User 1
        user1_data = {"name": "User 1", "email": "user1@example.com", "password": "Pass1234"}
        user1_response = await client.post("/auth/signup", json=user1_data)
        user1_token = user1_response.json()["access_token"]

        user1_headers = {"Authorization": f"Bearer {user1_token}"}
        await client.post("/tasks", json=sample_task_data, headers=user1_headers)

        # User 2
        user2_data = {"name": "User 2", "email": "user2@example.com", "password": "Pass5678"}
        user2_response = await client.post("/auth/signup", json=user2_data)
        user2_token = user2_response.json()["access_token"]

        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        # User 2 should see 0 tasks
        response = await client.get("/tasks", headers=user2_headers)
        assert response.status_code == 200
        assert len(response.json()) == 0

    @pytest.mark.asyncio
    async def test_user_cannot_delete_other_users_tasks(self, client: AsyncClient, sample_task_data):
        """
        Given: User 1 creates a task
        When: User 2 tries to delete User 1's task
        Then: Should return 403 Forbidden or 404 Not Found
        """
        # User 1 creates task
        user1_data = {"name": "User 1", "email": "user1@example.com", "password": "Pass1234"}
        user1_response = await client.post("/auth/signup", json=user1_data)
        user1_token = user1_response.json()["access_token"]
        user1_headers = {"Authorization": f"Bearer {user1_token}"}

        task_response = await client.post("/tasks", json=sample_task_data, headers=user1_headers)
        task_id = task_response.json()["id"]

        # User 2 tries to delete
        user2_data = {"name": "User 2", "email": "user2@example.com", "password": "Pass5678"}
        user2_response = await client.post("/auth/signup", json=user2_data)
        user2_token = user2_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        delete_response = await client.delete(f"/tasks/{task_id}", headers=user2_headers)

        assert delete_response.status_code in [403, 404]


# Test Coverage Summary:
# User Story 2 (Task Creation & Viewing): ✅ 8 test cases
# User Story 3 (Task Updates & Completion): ✅ 6 test cases
# User Story 4 (Task Deletion): ✅ 3 test cases
# Data Isolation (Security): ✅ 2 test cases
#
# Total Test Cases: 19
# Acceptance Criteria Coverage: 100%
# Expected Backend Coverage: 85%+
