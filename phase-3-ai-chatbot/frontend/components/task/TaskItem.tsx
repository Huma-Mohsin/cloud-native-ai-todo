'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task, UpdateTaskRequest } from '@/lib/types';
import { PriorityBadge, DueDateBadge, CategoryBadge, TagList } from './ui/Badges';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  availableCategories?: string[];
  animationType?: 'created' | 'updated' | 'completed' | 'none';
}

// Light theme color palette with soft pastel background tones
const lightCardColors = [
  'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-400 hover:from-blue-100 hover:to-blue-50', // Blue
  'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-200 hover:border-purple-400 hover:from-purple-100 hover:to-purple-50', // Purple
  'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200 hover:border-emerald-400 hover:from-emerald-100 hover:to-emerald-50', // Emerald
  'bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200 hover:border-amber-400 hover:from-amber-100 hover:to-amber-50', // Amber
  'bg-gradient-to-r from-sky-50 to-sky-100/50 border-sky-200 hover:border-sky-400 hover:from-sky-100 hover:to-sky-50', // Sky
  'bg-gradient-to-r from-pink-50 to-pink-100/50 border-pink-200 hover:border-pink-400 hover:from-pink-100 hover:to-pink-50', // Pink
  'bg-gradient-to-r from-violet-50 to-violet-100/50 border-violet-200 hover:border-violet-400 hover:from-violet-100 hover:to-violet-50', // Violet
  'bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-200 hover:border-orange-400 hover:from-orange-100 hover:to-orange-50', // Orange
  'bg-gradient-to-r from-teal-50 to-teal-100/50 border-teal-200 hover:border-teal-400 hover:from-teal-100 hover:to-teal-50', // Teal
  'bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-indigo-200 hover:border-indigo-400 hover:from-indigo-100 hover:to-indigo-50', // Indigo
  'bg-gradient-to-r from-rose-50 to-rose-100/50 border-rose-200 hover:border-rose-400 hover:from-rose-100 hover:to-rose-50', // Rose
  'bg-gradient-to-r from-cyan-50 to-cyan-100/50 border-cyan-200 hover:border-cyan-400 hover:from-cyan-100 hover:to-cyan-50', // Cyan
];

// Get consistent card color based on task ID
const getCardColor = (taskId: number): string => {
  return lightCardColors[taskId % lightCardColors.length];
};

// Priority-based gradient accents for left border
const priorityGradients = {
  high: 'from-error-500 to-error-600',
  medium: 'from-warning-500 to-warning-600',
  low: 'from-primary-300 to-primary-400',
};

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  availableCategories,
  animationType = 'none',
}: TaskItemProps) {
  const { language, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get light card color for this task
  const cardColor = getCardColor(task.id);

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

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  // Animation variants - updated for light theme
  const itemVariants = {
    created: {
      initial: { opacity: 0, x: 100, scale: 0.9 },
      animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        boxShadow: '0 4px 20px rgba(30, 144, 255, 0.25)',
      },
      exit: { opacity: 0, x: -100, scale: 0.8 },
    },
    updated: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.02, 1],
        backgroundColor: ['rgba(30, 144, 255, 0.05)', 'rgba(30, 144, 255, 0.12)', 'rgba(30, 144, 255, 0.05)'],
      },
      exit: { opacity: 0, x: -100, scale: 0.8 },
    },
    completed: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.05, 1],
        boxShadow: ['0 0 0px rgba(16, 185, 129, 0)', '0 4px 20px rgba(16, 185, 129, 0.4)', '0 0 0px rgba(16, 185, 129, 0)'],
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

  return (
    <motion.div
      layout
      initial={currentVariant.initial}
      animate={currentVariant.animate}
      exit={currentVariant.exit}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative rounded-xl shadow-md transition-all hover:shadow-lg border-2 ${cardColor} ${
        task.completed ? 'opacity-70' : ''
      }`}
    >
      {/* Status Indicator Line - Gradient based on priority */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-gradient-to-b ${
          task.completed
            ? 'from-success-500 to-success-600'
            : isOverdue
            ? 'from-error-500 to-error-600'
            : priorityGradients[task.priority as keyof typeof priorityGradients] || 'from-primary-300 to-primary-400'
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
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border-2 border-primary-200 appearance-none cursor-pointer disabled:cursor-wait focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all hover:border-primary-400 checked:bg-gradient-to-br checked:from-success-500 checked:to-success-600 checked:border-success-500 shadow-sm"
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
              {/* Task ID Badge - Gradient based on priority */}
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-sm ${
                task.priority === 'high'
                  ? 'bg-gradient-to-r from-error-100 to-error-50 text-error-600 border border-error-200'
                  : task.priority === 'medium'
                  ? 'bg-gradient-to-r from-warning-100 to-warning-50 text-warning-600 border border-warning-200'
                  : 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-600 border border-primary-200'
              }`}>
                #{task.id}
              </span>

              <h3
                className={`text-base sm:text-lg font-semibold text-content break-words leading-relaxed ${
                  task.completed ? 'line-through opacity-50' : ''
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
              <p className="text-sm sm:text-base text-content-secondary break-words mt-3 leading-relaxed">
                {task.description}
              </p>
            )}

            <p className="mt-3 text-xs sm:text-sm text-content-muted">
              {t('created')} {new Date(task.created_at).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US')}
              {task.updated_at !== task.created_at && (
                <span> • {t('updated')} {new Date(task.updated_at).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US')}</span>
              )}
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm sm:text-base text-error-500 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}
