'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getWebSocketService, TaskEvent, TaskEventHandler } from '@/services/websocketService';

interface UseWebSocketProps {
  userId: string;
  token?: string;
  onEvent?: TaskEventHandler;
  enabled?: boolean;
}

/**
 * Hook to manage WebSocket connection for real-time task updates.
 *
 * @param userId - User ID for WebSocket connection
 * @param token - JWT token for authentication
 * @param onEvent - Optional event handler callback
 * @param enabled - Whether to enable WebSocket connection (default: true)
 */
export function useWebSocket({ userId, token, onEvent, enabled = true }: UseWebSocketProps) {
  const wsService = useRef(getWebSocketService());
  const handlerRef = useRef(onEvent);

  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !userId || !token) {
      return;
    }

    // Connect to WebSocket
    wsService.current.connect(userId, token);

    // Subscribe to events
    const unsubscribe = wsService.current.subscribe((event: TaskEvent) => {
      handlerRef.current?.(event);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      wsService.current.disconnect();
    };
  }, [userId, token, enabled]);

  const isConnected = useCallback(() => {
    return wsService.current.isConnected();
  }, []);

  const getConnectionState = useCallback(() => {
    return wsService.current.getConnectionState();
  }, []);

  return { isConnected, getConnectionState };
}
