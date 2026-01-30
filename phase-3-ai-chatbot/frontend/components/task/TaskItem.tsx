/**
 * TaskItem Component - Metallic Chic Theme with Framer Motion Animations
 *
 * Animated task display with:
 * - CRUD animations (create, update, delete, complete)
 * - Priority, due date, category, tags
 * - Read-only view (all editing via chatbot)
 * - Toggle completion via checkbox
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/lib/types';
import { PriorityBadge, DueDateBadge, CategoryBadge, TagList } from './ui/Badges';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  availableCategories?: string[];
  animationType?: 'created' | 'updated' | 'completed' | 'none';
}

// Diverse pastel color palette - each one distinctly different
const pastelColors = [
  'bg-[#FFE5EC] border-[#FFB3C6]', // Soft Pink
  'bg-[#E5DEFF] border-[#C8B6FF]', // Lavender
  'bg-[#C1F0C1] border-[#90EE90]', // Mint Green
  'bg-[#FFE4B5] border-[#FFD700]', // Peach
  'bg-[#E0F4FF] border-[#87CEEB]', // Sky Blue
  'bg-[#FFF0DB] border-[#FFD580]', // Cream
  'bg-[#F0E5FF] border-[#D4B5FF]', // Light Purple
  'bg-[#FFEADB] border-[#FFB366]', // Light Coral
  'bg-[#E1F5E1] border-[#B2F5B2]', // Pale Green
  'bg-[#FFEEF8] border-[#FFCCE5]', // Baby Pink
  'bg-[#E5F3FF] border-[#99D6FF]', // Powder Blue
  'bg-[#FFF5E6] border-[#FFE4B3]', // Vanilla
  'bg-[#E8F5E8] border-[#B8E6B8]', // Seafoam
  'bg-[#FFE8F0] border-[#FFB8D1]', // Rose
  'bg-[#E0EBFF] border-[#B3CCFF]', // Periwinkle
  'bg-[#FFF0E5] border-[#FFDAB9]', // Apricot
  'bg-[#F5E8FF] border-[#DEB3FF]', // Mauve
  'bg-[#E8FFF0] border-[#B3FFCC]', // Aqua Mint
];

// Get consistent pastel color based on task ID
const getPastelColor = (taskId: number): string => {
  return pastelColors[taskId % pastelColors.length];
};

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  availableCategories,
  animationType = 'none',
}: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit state removed - all editing now via chatbot

  // Get pastel color for this task
  const pastelColor = getPastelColor(task.id);

  const handleToggle = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onToggle(task);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  // handleSave, handleCancel, handleDelete removed - all operations now via chatbot

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  // Animation variants
  const itemVariants = {
    created: {
      initial: { opacity: 0, x: 100, scale: 0.9 },
      animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
      },
      exit: { opacity: 0, x: -100, scale: 0.8 },
    },
    updated: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.02, 1],
        backgroundColor: ['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)'],
      },
      exit: { opacity: 0, x: -100, scale: 0.8 },
    },
    completed: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.05, 1],
        boxShadow: ['0 0 0px rgba(16, 185, 129, 0)', '0 0 20px rgba(16, 185, 129, 0.6)', '0 0 0px rgba(16, 185, 129, 0)'],
      },
      exit: { opacity: 0, x: -100, scale: 0.8 },
    },
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 0, x: -100, scale: 0.8 },
    },
  };

  const currentVariant = itemVariants[animationType];

  // EDIT MODE - Removed for chatbot-only control
  // All task editing is now done via chatbot commands

  // VIEW MODE
  return (
    <motion.div
      layout
      initial={currentVariant.initial}
      animate={currentVariant.animate}
      exit={currentVariant.exit}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative rounded-xl shadow-metallic transition-all hover:shadow-lg ${pastelColor} ${
        task.completed ? 'opacity-75' : ''
      }`}
    >
      {/* Status Indicator Line */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
          task.completed
            ? 'bg-success'
            : isOverdue
            ? 'bg-error'
            : task.priority === 'high'
            ? 'bg-error'
            : task.priority === 'medium'
            ? 'bg-warning'
            : 'bg-metallic-sky'
        }`}
      />

      <div className="p-5 sm:p-6 pl-7">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Checkbox */}
          <div className="relative mt-1.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              disabled={isLoading}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-md border-2 border-metallic-sky appearance-none cursor-pointer disabled:cursor-wait focus:ring-2 focus:ring-metallic-blue transition-all hover:border-metallic-blue checked:bg-success checked:border-success"
              aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            />
            {task.completed && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute top-0 left-0 h-6 w-6 sm:h-7 sm:w-7 text-white pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Task Title with ID Badge */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {/* Task ID Badge - Professional Style */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-metallic-blue/10 border border-metallic-blue/30 text-xs font-mono font-semibold text-metallic-blue">
                #{task.id}
              </span>

              <h3
                className={`text-base sm:text-lg font-semibold text-metallic-navy break-words leading-relaxed ${
                  task.completed ? 'line-through opacity-60' : ''
                }`}
              >
                {task.title}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-3">
              <PriorityBadge priority={task.priority} />
              {task.due_date && <DueDateBadge dueDate={task.due_date} completed={task.completed} />}
              {task.category && <CategoryBadge category={task.category} />}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="mb-3">
                <TagList tags={task.tags} maxDisplay={5} />
              </div>
            )}

            {task.description && (
              <p className="text-sm sm:text-base text-metallic-navy/70 break-words mt-3 leading-relaxed">
                {task.description}
              </p>
            )}

            <p className="mt-3 text-xs sm:text-sm text-metallic-navy/50">
              Created {new Date(task.created_at).toLocaleDateString()}
              {task.updated_at !== task.created_at && (
                <span> • Updated {new Date(task.updated_at).toLocaleDateString()}</span>
              )}
            </p>
          </div>

          {/* Action Buttons - Removed for chatbot-only control */}
          {/* All task operations (edit, delete) are now done via chatbot */}
        </div>

        {error && (
          <p className="mt-4 text-sm sm:text-base text-error font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}
