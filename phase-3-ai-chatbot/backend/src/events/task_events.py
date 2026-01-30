"""Task event definitions for WebSocket broadcasting."""

from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class TaskEventType(str, Enum):
    """Task event types for WebSocket broadcasting."""
    CREATED = "task_created"
    UPDATED = "task_updated"
    DELETED = "task_deleted"
    COMPLETED = "task_completed"


class TaskEvent(BaseModel):
    """Task event data structure."""
    type: TaskEventType
    task_id: int
    user_id: str
    data: Optional[Dict[str, Any]] = None
    timestamp: str

    class Config:
        use_enum_values = True
