/**
 * TaskList component for displaying a list of tasks.
 *
 * This component renders a filterable list of tasks with loading
 * and empty states.
 */

'use client';

import { useState } from 'react';
import { Task, UpdateTaskRequest } from '@/lib/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  isLoading?: boolean;
}

type FilterType = 'all' | 'pending' | 'completed';

export function TaskList({ tasks, onToggle, onUpdate, onDelete, isLoading = false }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Calculate counts
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
        <p className="mt-2 text-sm text-gray-300">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'completed'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-300">
            {filter === 'all' && 'No tasks yet. Create your first task above!'}
            {filter === 'pending' && 'No pending tasks. Great job!'}
            {filter === 'completed' && 'No completed tasks yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
