"""Tasks REST API endpoints for dashboard integration."""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from ...database import get_session
from ...models.task import Task
from ...auth.better_auth import get_current_user
from ...services.websocket_service import ws_manager
from ...events.task_events import TaskEventType

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("")
async def get_tasks(
    completed: Optional[bool] = Query(None),
    archived: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all tasks for the authenticated user with optional filters."""
    user_id = current_user["id"]

    # Build query
    query = select(Task).where(Task.user_id == user_id)

    # Apply filters
    if completed is not None:
        query = query.where(Task.completed == completed)

    if archived is not None:
        query = query.where(Task.archived == archived)

    if category:
        query = query.where(Task.category == category)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Task.title.ilike(search_pattern)) |
            (Task.description.ilike(search_pattern))
        )

    # Apply sorting
    if sort_by == "due_date":
        query = query.order_by(Task.due_date.asc())
    elif sort_by == "priority":
        # Custom priority order: high, medium, low
        query = query.order_by(
            func.case(
                (Task.priority == "high", 1),
                (Task.priority == "medium", 2),
                (Task.priority == "low", 3),
                else_=4
            )
        )
    elif sort_by == "position":
        query = query.order_by(Task.position.asc())
    else:  # created_at (default)
        query = query.order_by(Task.created_at.desc())

    result = await session.execute(query)
    tasks = result.scalars().all()
    return tasks


@router.post("")
async def create_task(
    task_data: dict,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Create a new task."""
    print(f"POST /tasks called with data: {task_data}")  # DEBUG
    user_id = current_user["id"]
    print(f"User ID: {user_id}")  # DEBUG

    try:
        # Parse due_date from ISO string to datetime if present
        due_date = None
        if task_data.get("due_date"):
            due_date_str = task_data.get("due_date")
            if isinstance(due_date_str, str):
                # Parse ISO 8601 format (e.g., '2026-01-29T17:05:06.879Z')
                try:
                    from datetime import datetime
                    # Remove 'Z' and parse
                    due_date_str = due_date_str.replace('Z', '+00:00')
                    due_date = datetime.fromisoformat(due_date_str)
                    # Convert to timezone-naive (database uses naive datetimes)
                    due_date = due_date.replace(tzinfo=None)
                    print(f"Parsed due_date: {due_date}")  # DEBUG
                except ValueError as e:
                    print(f"Failed to parse due_date: {e}")  # DEBUG
            else:
                due_date = due_date_str

        # Clean title (remove extra quotes if present)
        title = task_data["title"]
        if isinstance(title, str):
            title = title.strip('"').strip("'")

        # Create task
        task = Task(
            user_id=user_id,
            title=title,
            description=task_data.get("description"),
            priority=task_data.get("priority", "medium"),
            due_date=due_date,
            category=task_data.get("category"),
            tags=task_data.get("tags", []),
        )

        session.add(task)
        await session.commit()
        await session.refresh(task)

        print(f"Task created successfully! ID: {task.id}")  # DEBUG

        # Broadcast WebSocket event
        await ws_manager.broadcast_task_event(
            user_id=user_id,
            event_type=TaskEventType.CREATED,
            task_id=task.id,
            task_data=task.model_dump(mode="json"),
        )

        return task
    except Exception as e:
        print(f"Error creating task: {str(e)}")  # DEBUG
        raise HTTPException(status_code=400, detail=f"Failed to create task: {str(e)}")


@router.get("/stats")
async def get_task_stats(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get task statistics for the authenticated user."""
    user_id = current_user["id"]

    # Get all tasks
    result = await session.execute(
        select(Task).where(Task.user_id == user_id)
    )
    tasks = result.scalars().all()

    total = len(tasks)
    completed = sum(1 for t in tasks if t.completed)
    pending = total - completed

    # Count by priority
    high_priority = sum(1 for t in tasks if t.priority == "high" and not t.completed)
    medium_priority = sum(1 for t in tasks if t.priority == "medium" and not t.completed)
    low_priority = sum(1 for t in tasks if t.priority == "low" and not t.completed)

    # Count overdue
    now = datetime.utcnow()
    overdue = sum(
        1 for t in tasks
        if t.due_date and t.due_date < now and not t.completed
    )

    # Calculate completion rate
    completion_rate = round((completed / total * 100) if total > 0 else 0, 1)

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "high_priority": high_priority,
        "medium_priority": medium_priority,
        "low_priority": low_priority,
        "overdue": overdue,
        "completion_rate": completion_rate,
    }


@router.get("/today")
async def get_today_tasks(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get tasks due today."""
    user_id = current_user["id"]

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    result = await session.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .where(Task.due_date >= today_start)
        .where(Task.due_date < today_end)
        .order_by(Task.due_date.asc())
    )
    tasks = result.scalars().all()

    return tasks


@router.get("/overdue")
async def get_overdue_tasks(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get overdue tasks."""
    user_id = current_user["id"]
    now = datetime.utcnow()

    result = await session.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .where(Task.due_date < now)
        .where(Task.completed == False)
        .order_by(Task.due_date.asc())
    )
    tasks = result.scalars().all()

    return tasks


@router.get("/upcoming")
async def get_upcoming_tasks(
    days: int = Query(7, ge=1, le=30),
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get upcoming tasks (due in next N days)."""
    user_id = current_user["id"]

    now = datetime.utcnow()
    future = now + timedelta(days=days)

    result = await session.execute(
        select(Task)
        .where(Task.user_id == user_id)
        .where(Task.due_date >= now)
        .where(Task.due_date <= future)
        .where(Task.completed == False)
        .order_by(Task.due_date.asc())
    )
    tasks = result.scalars().all()

    return tasks


@router.get("/categories")
async def get_categories(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all unique categories for the user."""
    user_id = current_user["id"]

    result = await session.execute(
        select(Task.category)
        .where(Task.user_id == user_id)
        .where(Task.category.isnot(None))
        .distinct()
    )
    categories = result.scalars().all()

    return sorted([cat for cat in categories if cat])


@router.get("/{task_id}")
async def get_task(
    task_id: int,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific task by ID."""
    user_id = current_user["id"]

    task = await session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return task


@router.patch("/{task_id}/quick-update")
async def quick_update_task(
    task_id: int,
    task_data: dict,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Quick update task from interactive UI buttons.

    Handles updates from quick action buttons like priority, due_date, category, tags.
    Supports optimistic UI updates with WebSocket broadcasts.
    """
    print(f"Quick update called for task {task_id} with data: {task_data}")  # DEBUG
    user_id = current_user["id"]

    task = await session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Update fields (only allow specific quick-update fields)
    allowed_fields = ["priority", "due_date", "category", "description", "tags"]
    updated_fields = []
    for key, value in task_data.items():
        if key in allowed_fields and hasattr(task, key):
            # Special handling for due_date - parse ISO string
            if key == "due_date" and isinstance(value, str):
                try:
                    from datetime import datetime as dt
                    value = value.replace('Z', '+00:00')
                    value = dt.fromisoformat(value)
                    # Convert to timezone-naive (database uses naive datetimes)
                    value = value.replace(tzinfo=None)
                    print(f"Parsed due_date: {value}")  # DEBUG
                except ValueError as e:
                    print(f"Failed to parse due_date: {e}")  # DEBUG

            setattr(task, key, value)
            updated_fields.append(f"{key}={value}")

    print(f"Updated fields: {', '.join(updated_fields)}")  # DEBUG

    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    print(f"Task saved - Priority is now: {task.priority}")  # DEBUG

    # Broadcast WebSocket event for real-time sync
    await ws_manager.broadcast_task_event(
        user_id=user_id,
        event_type=TaskEventType.UPDATED,
        task_id=task.id,
        task_data=task.model_dump(mode="json"),
    )

    return task


@router.patch("/{task_id}")
async def update_task(
    task_id: int,
    task_data: dict,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update a task."""
    user_id = current_user["id"]

    task = await session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Update fields
    for key, value in task_data.items():
        if hasattr(task, key):
            setattr(task, key, value)

    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    # Determine event type
    event_type = TaskEventType.COMPLETED if task_data.get("completed") is not None else TaskEventType.UPDATED

    # Broadcast WebSocket event
    await ws_manager.broadcast_task_event(
        user_id=user_id,
        event_type=event_type,
        task_id=task.id,
        task_data=task.model_dump(mode="json"),
    )

    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a task."""
    user_id = current_user["id"]

    task = await session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await session.delete(task)
    await session.commit()

    # Broadcast WebSocket event
    await ws_manager.broadcast_task_event(
        user_id=user_id,
        event_type=TaskEventType.DELETED,
        task_id=task_id,
    )

    return {"message": "Task deleted successfully"}
