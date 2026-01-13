/**
 * Task API client for CRUD operations.
 *
 * This module provides wrapper functions around the generic fetchAPI client
 * for task-related operations with all professional features.
 */

import { fetchAPI, getAuthToken } from './api';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStats,
  Subtask,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
} from './types';

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
 * Task API client
 */
export const taskClient = {
  /**
   * Create a new task with all fields
   */
  create: async (data: CreateTaskRequest): Promise<Task> => {
    return fetchAPI<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all tasks with filtering and sorting
   */
  getAll: async (params?: TaskQueryParams): Promise<Task[]> => {
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
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';

    return fetchAPI<Task[]>(endpoint);
  },

  /**
   * Get task statistics
   */
  getStats: async (): Promise<TaskStats> => {
    return fetchAPI<TaskStats>('/tasks/stats');
  },

  /**
   * Get a specific task by ID
   */
  getById: async (taskId: number): Promise<Task> => {
    return fetchAPI<Task>(`/tasks/${taskId}`);
  },

  /**
   * Update a task (partial update supported)
   */
  update: async (taskId: number, data: UpdateTaskRequest): Promise<Task> => {
    return fetchAPI<Task>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a task
   */
  delete: async (taskId: number): Promise<void> => {
    await fetchAPI<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle task completion status
   */
  toggleComplete: async (task: Task): Promise<Task> => {
    return taskClient.update(task.id, { completed: !task.completed });
  },

  // Smart Filters

  /**
   * Get tasks due today
   */
  getToday: async (): Promise<Task[]> => {
    return fetchAPI<Task[]>('/tasks/today');
  },

  /**
   * Get overdue tasks
   */
  getOverdue: async (): Promise<Task[]> => {
    return fetchAPI<Task[]>('/tasks/overdue');
  },

  /**
   * Get upcoming tasks (due in next N days)
   */
  getUpcoming: async (days: number = 7): Promise<Task[]> => {
    return fetchAPI<Task[]>(`/tasks/upcoming?days=${days}`);
  },

  // Categories

  /**
   * Get all unique categories
   */
  getCategories: async (): Promise<string[]> => {
    return fetchAPI<string[]>('/tasks/categories');
  },

  // Bulk Operations

  /**
   * Update positions of multiple tasks (for drag & drop)
   */
  bulkUpdatePositions: async (positions: Record<string, number>): Promise<{ success: boolean }> => {
    return fetchAPI<{ success: boolean }>('/tasks/bulk/positions', {
      method: 'POST',
      body: JSON.stringify(positions),
    });
  },

  // Export

  /**
   * Export tasks as JSON
   */
  exportJSON: async (): Promise<Blob> => {
    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/export?format=json`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export tasks');
    }

    return response.blob();
  },

  /**
   * Export tasks as CSV
   */
  exportCSV: async (): Promise<Blob> => {
    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/export?format=csv`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
  create: async (taskId: number, data: CreateSubtaskRequest): Promise<Subtask> => {
    return fetchAPI<Subtask>(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all subtasks for a task
   */
  getAll: async (taskId: number): Promise<Subtask[]> => {
    return fetchAPI<Subtask[]>(`/tasks/${taskId}/subtasks`);
  },

  /**
   * Update a subtask
   */
  update: async (subtaskId: number, data: UpdateSubtaskRequest): Promise<Subtask> => {
    return fetchAPI<Subtask>(`/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a subtask
   */
  delete: async (subtaskId: number): Promise<void> => {
    await fetchAPI<void>(`/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle subtask completion
   */
  toggleComplete: async (subtask: Subtask): Promise<Subtask> => {
    return subtaskClient.update(subtask.id, { completed: !subtask.completed });
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
