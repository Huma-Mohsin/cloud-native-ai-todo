/**
 * TypeScript type definitions for the application.
 *
 * These types mirror the backend Pydantic schemas and SQLModel models
 * to ensure type safety across the frontend application.
 */

/**
 * User data returned from the API (excludes password)
 */
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

/**
 * Task priority levels
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * Subtask data
 */
export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

/**
 * Task data
 */
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  due_date: string | null;
  category: string | null;
  tags: string[];
  position: number;
  archived: boolean;
  subtasks?: Subtask[];
  created_at: string;
  updated_at: string;
}

/**
 * Task statistics
 */
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  overdue: number;
}

/**
 * Authentication token response
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Create task request payload
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string | null;
  category?: string | null;
  tags?: string[];
}

/**
 * Update task request payload (all fields optional for partial updates)
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
  due_date?: string | null;
  category?: string | null;
  tags?: string[];
  position?: number;
  archived?: boolean;
}

/**
 * Create subtask request payload
 */
export interface CreateSubtaskRequest {
  title: string;
}

/**
 * Update subtask request payload
 */
export interface UpdateSubtaskRequest {
  title?: string;
  completed?: boolean;
  position?: number;
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  detail: string;
}

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Validation error response (422 Unprocessable Entity)
 */
export interface ValidationErrorResponse {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}
