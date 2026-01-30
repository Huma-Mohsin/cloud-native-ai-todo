"""WebSocket connection manager and event broadcaster."""

from fastapi import WebSocket
from typing import Dict, Set
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections and broadcasts events."""

    def __init__(self):
        # user_id -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()

        self.active_connections[user_id].add(websocket)
        logger.info(
            f"WebSocket connected for user {user_id}. "
            f"Total connections: {len(self.active_connections[user_id])}"
        )

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)

            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

        logger.info(f"WebSocket disconnected for user {user_id}")

    async def broadcast_to_user(self, user_id: str, event: dict):
        """Broadcast an event to all connections for a specific user."""
        if user_id not in self.active_connections:
            logger.debug(f"No active connections for user {user_id}")
            return

        message = json.dumps(event)
        dead_connections = set()

        for connection in self.active_connections[user_id]:
            try:
                await connection.send_text(message)
                logger.debug(f"Sent event to user {user_id}: {event.get('type')}")
            except Exception as e:
                logger.error(f"Failed to send to connection: {e}")
                dead_connections.add(connection)

        # Clean up dead connections
        for connection in dead_connections:
            self.disconnect(connection, user_id)

    async def broadcast_task_event(
        self,
        user_id: str,
        event_type: str,
        task_id: int,
        task_data: dict = None,
    ):
        """Broadcast a task-related event."""
        event = {
            "type": event_type,
            "task_id": task_id,
            "data": task_data,
            "timestamp": datetime.utcnow().isoformat(),
        }

        await self.broadcast_to_user(user_id, event)
        logger.info(f"Broadcasted {event_type} for task {task_id} to user {user_id}")


# Global singleton instance
ws_manager = WebSocketManager()
