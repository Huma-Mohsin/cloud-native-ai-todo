/**
 * Subtasks List Component
 *
 * Interactive checklist of subtasks within a task with add/edit/delete/toggle.
 */

'use client';

import { useState } from 'react';
import { Subtask } from '@/lib/types';
import { subtaskClient } from '@/lib/tasks';

interface SubtasksListProps {
  taskId: number;
  subtasks: Subtask[];
  onUpdate: () => void;
  disabled?: boolean;
}

export function SubtasksList({ taskId, subtasks, onUpdate, disabled = false }: SubtasksListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSubtaskTitle.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await subtaskClient.create(taskId, { title: newSubtaskTitle.trim() });
      setNewSubtaskTitle('');
      setIsAdding(false);
      onUpdate();
    } catch (err: any) {
      setError(err.detail || 'Failed to add subtask');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (subtask: Subtask) => {
    if (disabled) return;

    try {
      await subtaskClient.toggleComplete(subtask);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  const handleDelete = async (subtaskId: number) => {
    if (disabled) return;

    try {
      await subtaskClient.delete(subtaskId);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to delete subtask:', err);
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-300">Subtasks</h4>
          {totalCount > 0 && (
            <span className="text-xs text-gray-400">
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>

        {!isAdding && !disabled && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 focus:outline-none"
          >
            + Add subtask
          </button>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Subtasks list */}
      {totalCount > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={handleToggle}
              onDelete={handleDelete}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Add subtask form */}
      {isAdding && (
        <form onSubmit={handleAddSubtask} className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Subtask title..."
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 text-sm border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 bg-gray-700 text-gray-200 placeholder-gray-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={isSubmitting || !newSubtaskTitle.trim()}
            className="px-3 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle('');
              setError('');
            }}
            disabled={isSubmitting}
            className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Empty state */}
      {totalCount === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-4">
          No subtasks yet. Add one to break down this task!
        </p>
      )}
    </div>
  );
}

/**
 * Subtask Item - Individual subtask with checkbox and actions
 */
interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtask: Subtask) => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
}

function SubtaskItem({ subtask, onToggle, onDelete, disabled }: SubtaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={() => onToggle(subtask)}
        disabled={disabled}
        className="w-4 h-4 text-emerald-600 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2 disabled:opacity-50 cursor-pointer bg-gray-700"
      />

      {/* Title */}
      <span
        className={`flex-1 text-sm ${
          subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'
        }`}
      >
        {subtask.title}
      </span>

      {/* Delete button (shows on hover) */}
      {isHovered && !disabled && (
        <button
          type="button"
          onClick={() => onDelete(subtask.id)}
          className="text-xs text-red-400 hover:text-red-300 focus:outline-none"
          title="Delete subtask"
        >
          Delete
        </button>
      )}
    </div>
  );
}
