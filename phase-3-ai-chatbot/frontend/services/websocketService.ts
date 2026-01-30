/**
 * WebSocket service for real-time task updates.
 *
 * Provides singleton WebSocket connection with auto-reconnection,
 * event subscription, and ping/pong keep-alive.
 */

export type TaskEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_completed';

export interface TaskEvent {
  type: TaskEventType;
  task_id: number;
  data?: any;
  timestamp: string;
}

export type TaskEventHandler = (event: TaskEvent) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private handlers: Set<TaskEventHandler> = new Set();
  private pingInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private token: string | null = null;
  private isConnecting = false;

  connect(userId: string, token: string): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.userId = userId;
    this.token = token;
    this.isConnecting = true;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const url = `${wsUrl}/ws/${userId}?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        if (event.data === 'pong') {
          console.log('🏓 Pong received');
          return;
        }

        try {
          const taskEvent: TaskEvent = JSON.parse(event.data);
          console.log('📨 WebSocket event received:', taskEvent);
          this.notifyHandlers(taskEvent);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        // Only log meaningful errors (ignore empty error objects from transient connection issues)
        if (error && Object.keys(error).length > 2) {
          console.error('❌ WebSocket error:', error);
        }
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopPing();
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    this.stopPing();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.userId = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    console.log('WebSocket disconnected manually');
  }

  subscribe(handler: TaskEventHandler): () => void {
    this.handlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler);
    };
  }

  private notifyHandlers(event: TaskEvent): void {
    this.handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
        console.log('🏓 Ping sent');
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    if (!this.userId || !this.token) {
      console.log('No credentials for reconnection');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.userId && this.token) {
        this.connect(this.userId, this.token);
      }
    }, delay);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }
}

// Singleton instance
let wsServiceInstance: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService {
  if (!wsServiceInstance) {
    wsServiceInstance = new WebSocketService();
  }
  return wsServiceInstance;
}
