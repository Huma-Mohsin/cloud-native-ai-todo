/**
 * TypeScript type definitions for Phase III AI Chatbot Dashboard.
 *
 * Extended from Phase II with WebSocket events and animation types.
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
  user_id: string;
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
  today?: number;
  this_week?: number;
  archived?: number;
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

// ============================================================================
// PHASE III EXTENSIONS: WebSocket & Real-time Updates
// ============================================================================

/**
 * WebSocket event types for real-time task updates
 */
export type TaskEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_completed';

/**
 * WebSocket task event
 */
export interface TaskEvent {
  type: TaskEventType;
  task_id: number;
  data?: Partial<Task>;
  timestamp: string;
}

/**
 * WebSocket connection state
 */
export type WebSocketState =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'CLOSING'
  | 'UNKNOWN';

// ============================================================================
// PHASE III EXTENSIONS: Animation Types
// ============================================================================

/**
 * Animation type for task CRUD operations
 */
export type TaskAnimationType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'completed'
  | 'none';

/**
 * Animation state for a task
 */
export interface TaskAnimationState {
  taskId: number;
  animationType: TaskAnimationType;
  timestamp: number;
}

// ============================================================================
// PHASE III EXTENSIONS: Filter & Sort Types
// ============================================================================

/**
 * Smart filter types
 */
export type SmartFilterType = 'all' | 'today' | 'overdue' | 'upcoming' | 'completed';

/**
 * Sort options
 */
export type SortOption = 'created_at' | 'due_date' | 'priority' | 'position';

/**
 * Filter state
 */
export interface FilterState {
  smartFilter: SmartFilterType;
  searchQuery: string;
  category: string | null;
  showCompleted: boolean;
  sortBy: SortOption;
}

// ============================================================================
// PHASE III EXTENSIONS: Dashboard Types
// ============================================================================

/**
 * Dashboard view mode (for mobile)
 */
export type DashboardView = 'chatbot' | 'dashboard';

/**
 * Chart data for analytics
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

/**
 * Weekly activity data
 */
export interface WeeklyActivityData {
  day: string;
  completed: number;
  created: number;
}

/**
 * Analytics data
 */
export interface AnalyticsData {
  stats: TaskStats;
  statusDistribution: ChartDataPoint[];
  priorityBreakdown: ChartDataPoint[];
  weeklyActivity: WeeklyActivityData[];
}

// ============================================================================
// PHASE III EXTENSIONS: Chat Types
// ============================================================================

/**
 * Chat message role
 */
export type ChatRole = 'user' | 'assistant';

/**
 * Chat message
 */
export interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
  created_at: string;
}

/**
 * Chat request
 */
export interface ChatRequest {
  message: string;
  conversation_id?: number | null;
}

/**
 * Chat response
 */
export interface ChatResponse {
  success: boolean;
  conversation_id: number;
  response: string;
  tool_calls?: any[];
}
