"""WebSocket endpoint for real-time task updates."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from typing import Optional
import logging

from ...services.websocket_service import ws_manager
from ...auth.better_auth import verify_session_token
from ...database import get_session
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    token: Optional[str] = Query(None),
):
    """
    WebSocket endpoint for real-time updates.

    Connection URL: ws://localhost:8000/ws/{user_id}?token={jwt_token}

    Events:
    - task_created: {type, task_id, data, timestamp}
    - task_updated: {type, task_id, data, timestamp}
    - task_deleted: {type, task_id, data, timestamp}
    - task_completed: {type, task_id, data, timestamp}
    """
    # Verify Better Auth session token from query parameter
    if not token:
        logger.warning(f"WebSocket connection attempt without token for user {user_id}")
        await websocket.accept()
        await websocket.close(code=1008, reason="Missing token")
        return

    try:
        # Get database session for validation
        async for db_session in get_session():
            try:
                # Validate Better Auth session token
                session_data = await verify_session_token(token, db_session)

                if not session_data:
                    logger.warning(f"WebSocket auth failed: invalid session token")
                    await websocket.accept()
                    await websocket.close(code=1008, reason="Invalid token")
                    return

                # Get user_id from session (verify_session_token returns 'id' not 'userId')
                token_user_id = session_data.get("id")

                if not token_user_id:
                    logger.warning(f"WebSocket auth failed: no user ID in session")
                    await websocket.accept()
                    await websocket.close(code=1008, reason="Invalid token")
                    return

                # Verify user authorization
                if token_user_id != user_id:
                    logger.warning(
                        f"WebSocket auth failed: session user {token_user_id} != {user_id}"
                    )
                    await websocket.accept()
                    await websocket.close(code=1008, reason="Unauthorized")
                    return

                # Validation successful - break out of the session loop
                break
            finally:
                # Close the database session after validation
                await db_session.close()

        # Accept connection after successful validation
        await ws_manager.connect(websocket, user_id)
        logger.info(f"WebSocket connection established for user {user_id}")

        try:
            while True:
                # Keep connection alive (ping/pong)
                data = await websocket.receive_text()

                # Handle ping messages
                if data == "ping":
                    await websocket.send_text("pong")
                    logger.debug(f"Ping/pong with user {user_id}")

        except WebSocketDisconnect:
            ws_manager.disconnect(websocket, user_id)
            logger.info(f"WebSocket disconnected normally for user {user_id}")

    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        try:
            await websocket.close(code=1011, reason="Internal error")
        except:
            pass
        ws_manager.disconnect(websocket, user_id)
