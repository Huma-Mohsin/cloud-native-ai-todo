/**
 * TaskItem component - Professional task display with all features.
 *
 * Displays task with:
 * - Priority, due date, category, tags
 * - Subtasks with progress
 * - Edit mode with all fields
 * - Expandable details
 */

'use client';

import { useState } from 'react';
import { Task, Priority, UpdateTaskRequest } from '@/lib/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { PriorityBadge } from './ui/PrioritySelector';
import { DueDateBadge } from './ui/DatePicker';
import { CategoryBadge } from './ui/CategoryInput';
import { TagList } from './ui/TagsInput';
import { SubtasksList } from './SubtasksList';
import { PrioritySelector } from './ui/PrioritySelector';
import { CategoryInput } from './ui/CategoryInput';
import { TagsInput } from './ui/TagsInput';
import { DatePicker } from './ui/DatePicker';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  onSubtasksUpdate?: () => void;
  availableCategories?: string[];
}

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onSubtasksUpdate,
  availableCategories,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit state
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDueDate, setEditDueDate] = useState<string | null>(task.due_date);
  const [editCategory, setEditCategory] = useState<string | null>(task.category);
  const [editTags, setEditTags] = useState<string[]>(task.tags || []);

  const handleToggle = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onToggle(task);
    } catch (err: any) {
      setError(err.detail || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const updateData: UpdateTaskRequest = {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        priority: editPriority,
        due_date: editDueDate,
        category: editCategory,
        tags: editTags,
      };

      await onUpdate(task.id, updateData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.detail || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.due_date);
    setEditCategory(task.category);
    setEditTags(task.tags || []);
    setIsEditing(false);
    setError('');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onDelete(task.id);
    } catch (err: any) {
      setError(err.detail || 'Failed to delete task');
      setIsLoading(false);
    }
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const subtasksCompleted = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtasksTotal = task.subtasks?.length || 0;

  // Check if task is overdue
  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  // EDIT MODE
  if (isEditing) {
    return (
      <div className="bg-[#132f4c] border-2 border-[#66b2ff] rounded-lg p-5 sm:p-6 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-[#66b2ff]">Edit Task</h4>
            <button
              onClick={handleCancel}
              className="text-sm text-[#b2bac2] hover:text-[#66b2ff]"
            >
              ✕
            </button>
          </div>

          {/* Title */}
          <Input
            id={`edit-title-${task.id}`}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={isLoading}
            placeholder="Task title"
            maxLength={200}
          />

          {/* Description */}
          <Input
            id={`edit-description-${task.id}`}
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            disabled={isLoading}
            placeholder="Description (optional)"
            maxLength={1000}
          />

          {/* Priority */}
          <PrioritySelector value={editPriority} onChange={setEditPriority} disabled={isLoading} />

          {/* Due Date */}
          <DatePicker value={editDueDate} onChange={setEditDueDate} disabled={isLoading} />

          {/* Category */}
          <CategoryInput
            value={editCategory}
            onChange={setEditCategory}
            availableCategories={availableCategories}
            disabled={isLoading}
          />

          {/* Tags */}
          <TagsInput value={editTags} onChange={setEditTags} disabled={isLoading} />

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSave} isLoading={isLoading} disabled={!editTitle.trim()}>
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW MODE
  return (
    <div
      className={`relative bg-[#132f4c] border rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] ${
        task.completed ? 'opacity-70 border-[#2a4a6f]' : isOverdue ? 'border-red-400' : 'border-[#2a4a6f]'
      }`}
    >
      {/* Status Indicator Line - Left Edge */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
          task.completed
            ? 'bg-green-500'
            : isOverdue
            ? 'bg-red-500'
            : task.priority === 'high'
            ? 'bg-red-400'
            : task.priority === 'medium'
            ? 'bg-orange-400'
            : 'bg-slate-400'
        }`}
      />

      <div className="p-5 sm:p-6 pl-7">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Checkbox - Custom Green Checkmark */}
          <div className="relative mt-1.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggle}
              disabled={isLoading}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-md border-2 border-gray-300 appearance-none cursor-pointer disabled:cursor-wait focus:ring-2 focus:ring-green-500 transition-all hover:border-green-500 checked:bg-green-600 checked:border-green-600"
              aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            />
            {task.completed && (
              <svg
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
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`text-base sm:text-lg font-semibold text-[#b2bac2] mb-3 break-words leading-relaxed ${
                task.completed ? 'line-through text-[#7a8592]' : ''
              }`}
            >
              {task.title}
            </h3>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-3">
              <PriorityBadge priority={task.priority} size="md" />
              {task.due_date && <DueDateBadge dueDate={task.due_date} completed={task.completed} />}
              {task.category && <CategoryBadge category={task.category} />}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="mb-3">
                <TagList tags={task.tags} maxDisplay={5} />
              </div>
            )}

            {/* Description */}
            {task.description && (
              <p className="text-sm sm:text-base text-[#8b9ab0] break-words mt-3 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Subtasks Summary */}
            {hasSubtasks && (
              <div className="mt-3 text-sm sm:text-base text-[#8b9ab0] font-medium">
                ☑ {subtasksCompleted}/{subtasksTotal} subtasks completed
              </div>
            )}

            {/* Metadata */}
            <p className="mt-3 text-xs sm:text-sm text-[#7a8592]">
              Created {new Date(task.created_at).toLocaleDateString()}
              {task.updated_at !== task.created_at && (
                <span> • Updated {new Date(task.updated_at).toLocaleDateString()}</span>
              )}
            </p>
          </div>

          {/* Action Buttons - Show on hover with icons only */}
          <div className="flex sm:flex-col gap-2 flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
            {hasSubtasks && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-[#b2bac2] hover:text-[#66b2ff] hover:bg-[#1e3a5f] rounded-lg transition-colors"
                title={isExpanded ? "Hide subtasks" : "Show subtasks"}
                aria-label={isExpanded ? "Hide subtasks" : "Show subtasks"}
              >
                <span className="text-lg">{isExpanded ? '▲' : '▼'}</span>
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="p-2 text-[#66b2ff] hover:text-[#b2bac2] hover:bg-[#1e3a5f] disabled:opacity-50 rounded-lg transition-colors"
              aria-label="Edit task"
              title="Edit task"
            >
              <span className="text-lg">✏️</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-50 rounded-lg transition-colors"
              aria-label="Delete task"
              title="Delete task"
            >
              <span className="text-lg">🗑️</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-4 text-sm sm:text-base text-red-400 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Expanded Subtasks Section */}
      {isExpanded && hasSubtasks && (
        <div className="border-t-2 border-[#1e3a5f] p-5 sm:p-6 bg-[#0f2335]">
          <SubtasksList
            taskId={task.id}
            subtasks={task.subtasks || []}
            onUpdate={onSubtasksUpdate || (() => {})}
            disabled={task.completed}
          />
        </div>
      )}
    </div>
  );
}
