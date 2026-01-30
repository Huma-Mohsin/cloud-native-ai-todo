/**
 * Chat Service - API client for Phase III AI Chatbot
 *
 * Handles all communication with the backend chat API
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  quick_actions?: QuickActionsData;
}

export interface QuickActionsData {
  type: string;
  task_id?: number;  // Optional for task_creation type
  pending_task?: {   // For task_creation type
    title: string;
    description?: string | null;
    user_id: string;
  };
  actions: Array<{
    id: string;
    label: string;
    type: 'button_group' | 'date_picker' | 'dropdown' | 'text_input' | 'tag_input';
    options?: Array<{ value: string; label: string; icon?: string }> | string[];
    quick_options?: string[];
    suggestions?: string[];
    placeholder?: string;
  }>;
}

export interface ChatRequest {
  conversation_id?: number | null;
  message: string;
  language?: string;
}

export interface ChatResponse {
  success: boolean;
  conversation_id: number;
  response: string;
  quick_actions?: QuickActionsData;
  tool_calls: Array<{
    tool: string;
    arguments: Record<string, any>;
    result: Record<string, any>;
  }>;
  error?: string;
}

export class ChatService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  async sendMessage(
    message: string,
    userId: string,
    token: string,
    conversationId?: number | null,
    language?: string
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/${userId}/chat`, {
      method: 'POST',
      credentials: 'include', // Send cookies with request
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add JWT token for backend authentication
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
        language: language || 'en',
      } as ChatRequest),
    });

    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in again');
    }

    if (response.status === 403) {
      throw new Error('Forbidden: You do not have access to this resource');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createTaskWithDetails(
    taskData: Record<string, any>,
    token: string
  ): Promise<any> {
    const url = `${this.baseUrl}/api/tasks`;
    console.log('🔵 Creating task at:', url);
    console.log('🔵 Task data:', taskData);
    console.log('🔵 Token present:', !!token);

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      console.log('🔵 Response status:', response.status);
      console.log('🔵 Response ok:', response.ok);

      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }

      if (response.status === 403) {
        throw new Error('Forbidden: You do not have access to this resource');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('🔴 Fetch error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        url,
        token: token ? 'present' : 'missing'
      });
      throw error;
    }
  }

  async quickUpdateTask(
    taskId: number,
    updates: Record<string, any>,
    token: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}/quick-update`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in again');
    }

    if (response.status === 403) {
      throw new Error('Forbidden: You do not have access to this resource');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

let chatServiceInstance: ChatService | null = null;

export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService();
  }
  return chatServiceInstance;
}
