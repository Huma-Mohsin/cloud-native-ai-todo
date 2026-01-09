/**
 * TypeScript types for Phase II Todo API
 * Generated from OpenAPI specification
 * Auto-generated - do not modify manually
 */

// ============================================================================
// Auth Types
// ============================================================================

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string; // ISO 8601 datetime
}

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export type TaskListResponse = Task[];

export interface ErrorResponse {
  error: string;
  detail?: Record<string, any> | null;
}

// ============================================================================
// API Client Types
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  token?: string;
}

export interface ApiError extends Error {
  status: number;
  data?: ErrorResponse;
}
