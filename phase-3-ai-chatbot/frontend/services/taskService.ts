/**
 * Task API client for Phase III AI Chatbot Dashboard.
 *
 * Adapted from Phase II with Better Auth integration.
 */

import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStats,
  Subtask,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
} from '@/lib/types';

/**
 * Task query parameters for filtering and sorting
 */
export interface TaskQueryParams {
  completed?: boolean;
  archived?: boolean;
  category?: string;
  search?: string;
  sort_by?: 'created_at' | 'due_date' | 'priority' | 'position';
}

/**
 * Generic API fetch wrapper with authentication
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for Better Auth
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }

  // Handle empty responses (e.g., DELETE)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json();
}

/**
 * Task API client
 */
export const taskClient = {
  /**
   * Create a new task with all fields
   */
  create: async (data: CreateTaskRequest, token?: string): Promise<Task> => {
    return fetchAPI<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  /**
   * Get all tasks with filtering and sorting
   */
  getAll: async (params?: TaskQueryParams, token?: string): Promise<Task[]> => {
    const queryParams = new URLSearchParams();

    if (params?.completed !== undefined) {
      queryParams.append('completed', String(params.completed));
    }
    if (params?.archived !== undefined) {
      queryParams.append('archived', String(params.archived));
    }
    if (params?.category) {
      queryParams.append('category', params.category);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/tasks?${queryString}` : '/api/tasks';

    return fetchAPI<Task[]>(endpoint, {}, token);
  },

  /**
   * Get task statistics
   */
  getStats: async (token?: string): Promise<TaskStats> => {
    return fetchAPI<TaskStats>('/api/tasks/stats', {}, token);
  },

  /**
   * Get a specific task by ID
   */
  getById: async (taskId: number, token?: string): Promise<Task> => {
    return fetchAPI<Task>(`/api/tasks/${taskId}`, {}, token);
  },

  /**
   * Update a task (partial update supported)
   */
  update: async (taskId: number, data: UpdateTaskRequest, token?: string): Promise<Task> => {
    return fetchAPI<Task>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  },

  /**
   * Delete a task
   */
  delete: async (taskId: number, token?: string): Promise<void> => {
    await fetchAPI<void>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    }, token);
  },

  /**
   * Toggle task completion status
   */
  toggleComplete: async (task: Task, token?: string): Promise<Task> => {
    return taskClient.update(task.id, { completed: !task.completed }, token);
  },

  // Smart Filters

  /**
   * Get tasks due today
   */
  getToday: async (token?: string): Promise<Task[]> => {
    return fetchAPI<Task[]>('/api/tasks/today', {}, token);
  },

  /**
   * Get overdue tasks
   */
  getOverdue: async (token?: string): Promise<Task[]> => {
    return fetchAPI<Task[]>('/api/tasks/overdue', {}, token);
  },

  /**
   * Get upcoming tasks (due in next N days)
   */
  getUpcoming: async (days: number = 7, token?: string): Promise<Task[]> => {
    return fetchAPI<Task[]>(`/api/tasks/upcoming?days=${days}`, {}, token);
  },

  // Categories

  /**
   * Get all unique categories
   */
  getCategories: async (token?: string): Promise<string[]> => {
    return fetchAPI<string[]>('/api/tasks/categories', {}, token);
  },

  // Bulk Operations

  /**
   * Update positions of multiple tasks (for drag & drop)
   */
  bulkUpdatePositions: async (
    positions: Record<string, number>,
    token?: string
  ): Promise<{ success: boolean }> => {
    return fetchAPI<{ success: boolean }>('/api/tasks/bulk/positions', {
      method: 'POST',
      body: JSON.stringify(positions),
    }, token);
  },

  // Export

  /**
   * Export tasks as JSON
   */
  exportJSON: async (token?: string): Promise<Blob> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/tasks/export?format=json`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export tasks');
    }

    return response.blob();
  },

  /**
   * Export tasks as CSV
   */
  exportCSV: async (token?: string): Promise<Blob> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/tasks/export?format=csv`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export tasks');
    }

    return response.blob();
  },
};

/**
 * Subtask API client
 */
export const subtaskClient = {
  /**
   * Create a new subtask for a task
   */
  create: async (
    taskId: number,
    data: CreateSubtaskRequest,
    token?: string
  ): Promise<Subtask> => {
    return fetchAPI<Subtask>(`/api/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  /**
   * Get all subtasks for a task
   */
  getAll: async (taskId: number, token?: string): Promise<Subtask[]> => {
    return fetchAPI<Subtask[]>(`/api/tasks/${taskId}/subtasks`, {}, token);
  },

  /**
   * Update a subtask
   */
  update: async (
    subtaskId: number,
    data: UpdateSubtaskRequest,
    token?: string
  ): Promise<Subtask> => {
    return fetchAPI<Subtask>(`/api/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  },

  /**
   * Delete a subtask
   */
  delete: async (subtaskId: number, token?: string): Promise<void> => {
    await fetchAPI<void>(`/api/subtasks/${subtaskId}`, {
      method: 'DELETE',
    }, token);
  },

  /**
   * Toggle subtask completion
   */
  toggleComplete: async (subtask: Subtask, token?: string): Promise<Subtask> => {
    return subtaskClient.update(subtask.id, { completed: !subtask.completed }, token);
  },
};

/**
 * Helper functions for client-side task filtering
 */
export const taskFilters = {
  /**
   * Filter tasks by priority
   */
  byPriority: (tasks: Task[], priority: 'low' | 'medium' | 'high'): Task[] => {
    return tasks.filter((task) => task.priority === priority);
  },

  /**
   * Filter tasks by category
   */
  byCategory: (tasks: Task[], category: string): Task[] => {
    return tasks.filter((task) => task.category === category);
  },

  /**
   * Filter tasks by tag
   */
  byTag: (tasks: Task[], tag: string): Task[] => {
    return tasks.filter((task) => task.tags.includes(tag));
  },

  /**
   * Check if task is overdue
   */
  isOverdue: (task: Task): boolean => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < new Date();
  },

  /**
   * Check if task is due today
   */
  isDueToday: (task: Task): boolean => {
    if (!task.due_date) return false;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  },

  /**
   * Get tasks due this week
   */
  dueThisWeek: (tasks: Task[]): Task[] => {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter((task) => {
      if (!task.due_date || task.completed) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= now && dueDate <= weekLater;
    });
  },
};

/**
 * Wrapper functions for easier imports in hooks
 */

export async function getTasks(userId: string, token?: string): Promise<Task[]> {
  return taskClient.getAll({}, token);
}

export async function createTask(userId: string, data: CreateTaskRequest, token?: string): Promise<Task> {
  return taskClient.create(data, token);
}

export async function updateTask(userId: string, taskId: number, data: UpdateTaskRequest, token?: string): Promise<Task> {
  return taskClient.update(taskId, data, token);
}

export async function deleteTask(userId: string, taskId: number, token?: string): Promise<void> {
  return taskClient.delete(taskId, token);
}

export async function getTaskStats(userId: string, token?: string): Promise<TaskStats> {
  return taskClient.getStats(token);
}

export async function getTasksBySmartFilter(
  userId: string,
  filter: 'all' | 'today' | 'overdue' | 'upcoming' | 'completed',
  token?: string
): Promise<Task[]> {
  switch (filter) {
    case 'today':
      return taskClient.getToday(token);
    case 'overdue':
      return taskClient.getOverdue(token);
    case 'upcoming':
      return taskClient.getUpcoming(7, token);
    case 'completed':
      return taskClient.getAll({ completed: true }, token);
    case 'all':
    default:
      return taskClient.getAll({}, token);
  }
}

export function sortTasks(tasks: Task[], sortBy: 'created_at' | 'due_date' | 'priority' | 'position'): Task[] {
  const sorted = [...tasks];

  switch (sortBy) {
    case 'created_at':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    case 'due_date':
      return sorted.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

    case 'priority':
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    case 'position':
      return sorted.sort((a, b) => (a.position || 0) - (b.position || 0));

    default:
      return sorted;
  }
}
