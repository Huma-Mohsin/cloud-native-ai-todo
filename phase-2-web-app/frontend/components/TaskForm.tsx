/**
 * TaskForm component for creating new tasks with professional features.
 *
 * This component provides a comprehensive form for users to create tasks with:
 * - Title and description
 * - Priority levels (Low/Medium/High)
 * - Due dates with presets
 * - Categories
 * - Tags
 */

'use client';

import { useState } from 'react';
import { Priority, CreateTaskRequest } from '@/lib/types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { PrioritySelector } from './ui/PrioritySelector';
import { CategoryInput } from './ui/CategoryInput';
import { TagsInput } from './ui/TagsInput';
import { DatePicker } from './ui/DatePicker';

interface TaskFormProps {
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  isLoading?: boolean;
  availableCategories?: string[];
}

export function TaskForm({ onSubmit, isLoading = false, availableCategories }: TaskFormProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate title
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (title.length > 200) {
      setError('Task title must be 200 characters or less');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return;
    }

    try {
      // Prepare task data
      const taskData: CreateTaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      await onSubmit(taskData);

      // Clear form on success
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(null);
      setCategory(null);
      setTags([]);
      setShowAdvanced(false);
    } catch (err: any) {
      setError(err.detail || 'Failed to create task');
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(null);
    setCategory(null);
    setTags([]);
    setError('');
    setShowAdvanced(false);
  };

  const hasAdvancedFields = dueDate || category || tags.length > 0 || priority !== 'medium';

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {/* Title and Submit Button */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1">
          <Input
            id="task-title"
            type="text"
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            required
            maxLength={200}
          />
        </div>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!title.trim()}
          className="sm:w-auto w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-6 py-3 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-all duration-200 text-base transform hover:scale-105"
        >
          ➕ Add Task
        </Button>
      </div>

      {/* Description */}
      <div>
        <Input
          id="task-description"
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          maxLength={1000}
        />
      </div>

      {/* Toggle Advanced Options */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-base font-medium text-[#66b2ff] hover:text-[#b2bac2] focus:outline-none flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">{showAdvanced ? '🔽' : '▶️'}</span>
          <span>
            {showAdvanced ? 'Hide' : 'Show'} advanced options
            {hasAdvancedFields && !showAdvanced && ' (fields set)'}
          </span>
        </button>

        {(showAdvanced || hasAdvancedFields) && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-[#8b9ab0] hover:text-red-400 focus:outline-none transition-colors"
          >
            🔄 Reset all fields
          </button>
        )}
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-5 bg-[#1a1a1a] rounded-xl border-2 border-[#3a3a3a] shadow-lg">
          {/* Priority Selector */}
          <PrioritySelector value={priority} onChange={setPriority} disabled={isLoading} />

          {/* Due Date */}
          <DatePicker value={dueDate} onChange={setDueDate} disabled={isLoading} />

          {/* Category */}
          <CategoryInput
            value={category}
            onChange={setCategory}
            availableCategories={availableCategories}
            disabled={isLoading}
          />

          {/* Tags */}
          <TagsInput
            value={tags}
            onChange={setTags}
            disabled={isLoading}
            placeholder="Add tags (press Enter)"
            maxTags={10}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border-2 border-red-400 rounded-xl p-4">
          <p className="text-sm font-medium text-red-400 flex items-center gap-2" role="alert">
            <span className="text-lg">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Quick Summary */}
      {hasAdvancedFields && (
        <div className="text-sm text-[#b2bac2] bg-[#2d2d2d] p-4 rounded-xl border-2 border-[#3a3a3a] shadow-lg">
          <strong className="text-base text-[#66b2ff]">📝 Task Summary:</strong>
          {' '}
          <span className="font-semibold">{priority}</span> priority
          {dueDate && <span>, due {new Date(dueDate).toLocaleDateString()}</span>}
          {category && <span>, in {category}</span>}
          {tags.length > 0 && <span>, with {tags.length} tag(s)</span>}
        </div>
      )}
    </form>
  );
}
