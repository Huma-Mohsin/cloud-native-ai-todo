/**
 * TaskList Component - Metallic Chic Theme with Animations
 *
 * Displays a filterable list of tasks with:
 * - Framer Motion animations
 * - Loading and empty states
 * - Filter tabs
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, UpdateTaskRequest } from '@/lib/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  isLoading?: boolean;
  availableCategories?: string[];
  lastEventTaskId?: number | null;
  lastEventType?: 'created' | 'updated' | 'completed' | null;
}

type FilterType = 'all' | 'pending' | 'completed';

export function TaskList({
  tasks,
  onToggle,
  onUpdate,
  onDelete,
  isLoading = false,
  availableCategories,
  lastEventTaskId,
  lastEventType,
}: TaskListProps) {
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
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-metallic-blue border-r-transparent"></div>
        <p className="mt-2 text-sm text-metallic-navy">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-metallic-sky/30">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-metallic-blue text-metallic-blue'
              : 'border-transparent text-metallic-navy/70 hover:text-metallic-navy'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-metallic-blue text-metallic-blue'
              : 'border-transparent text-metallic-navy/70 hover:text-metallic-navy'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'completed'
              ? 'border-metallic-blue text-metallic-blue'
              : 'border-transparent text-metallic-navy/70 hover:text-metallic-navy'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task list with animations */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-lg border border-metallic-sky/30"
        >
          <p className="text-metallic-navy">
            {filter === 'all' && '📋 No tasks yet. Create your first task!'}
            {filter === 'pending' && '✅ No pending tasks. Great job!'}
            {filter === 'completed' && '🎯 No completed tasks yet.'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div className="space-y-3">
            {filteredTasks.map((task, index) => {
              // Determine animation type for this task
              const animationType =
                lastEventTaskId === task.id && lastEventType
                  ? lastEventType
                  : 'none';

              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  availableCategories={availableCategories}
                  animationType={animationType}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
