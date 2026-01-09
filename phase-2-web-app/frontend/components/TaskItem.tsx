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
      <div className="bg-white border-2 border-blue-500 rounded-lg p-5 sm:p-6 shadow-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Edit Task</h4>
            <button
              onClick={handleCancel}
              className="text-sm text-gray-500 hover:text-gray-700"
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
            <p className="text-sm text-red-600" role="alert">
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
      className={`bg-white border rounded-lg shadow-sm transition-all hover:shadow-md ${
        task.completed ? 'opacity-70 border-gray-300' : isOverdue ? 'border-red-400' : 'border-gray-200'
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            disabled={isLoading}
            className="mt-1.5 h-6 w-6 sm:h-6 sm:w-6 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
            aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3
              className={`text-base sm:text-lg font-semibold text-gray-900 mb-3 break-words leading-relaxed ${
                task.completed ? 'line-through text-gray-500' : ''
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
              <p className="text-sm sm:text-base text-gray-700 break-words mt-3 leading-relaxed">
                {task.description}
              </p>
            )}

            {/* Subtasks Summary */}
            {hasSubtasks && (
              <div className="mt-3 text-sm sm:text-base text-gray-600 font-medium">
                ☑ {subtasksCompleted}/{subtasksTotal} subtasks completed
              </div>
            )}

            {/* Metadata */}
            <p className="mt-3 text-xs sm:text-sm text-gray-500">
              Created {new Date(task.created_at).toLocaleDateString()}
              {task.updated_at !== task.created_at && (
                <span> • Updated {new Date(task.updated_at).toLocaleDateString()}</span>
              )}
            </p>
          </div>

          {/* Action Buttons - Mobile: Icon only, Desktop: Text */}
          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            {hasSubtasks && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation text-base font-medium"
                title="Show subtasks"
                aria-label={isExpanded ? "Hide subtasks" : "Show subtasks"}
              >
                <span className="text-base">{isExpanded ? '▲' : '▼'}</span>
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition-colors touch-manipulation text-sm font-medium"
              aria-label="Edit task"
            >
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden text-lg">✏️</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-colors touch-manipulation text-sm font-medium"
              aria-label="Delete task"
            >
              <span className="hidden sm:inline">Delete</span>
              <span className="sm:hidden text-lg">🗑️</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-4 text-sm sm:text-base text-red-600 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Expanded Subtasks Section */}
      {isExpanded && hasSubtasks && (
        <div className="border-t-2 border-gray-200 p-5 sm:p-6 bg-gray-50">
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
