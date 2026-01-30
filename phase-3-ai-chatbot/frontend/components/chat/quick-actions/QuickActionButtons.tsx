'use client';

import { useState } from 'react';
import { PriorityButtonGroup } from './PriorityButtonGroup';
import { DatePickerQuick } from './DatePickerQuick';
import { QuickActionDropdown } from './QuickActionDropdown';
import { TagInput } from './TagInput';

export interface QuickAction {
  id: string;
  label: string;
  type: 'button_group' | 'date_picker' | 'dropdown' | 'text_input' | 'tag_input';
  options?: Array<{ value: string; label: string; icon?: string }>;
  quick_options?: string[];
  suggestions?: string[];
  placeholder?: string;
}

export interface QuickActionsData {
  type: string;
  task_id?: number;
  pending_task?: {
    title: string;
    description?: string | null;
    user_id: string;
  };
  actions: QuickAction[];
}

interface QuickActionButtonsProps {
  data: QuickActionsData;
  onUpdate: (taskId: number, updates: Record<string, any>) => Promise<void>;
  onCreate: (taskData: Record<string, any>) => Promise<void>;
  onSkip: () => void;
}

export function QuickActionButtons({ data, onUpdate, onCreate, onSkip }: QuickActionButtonsProps) {
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState('');

  const handleActionUpdate = (actionId: string, value: any) => {
    setUpdates((prev) => ({ ...prev, [actionId]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (data.type === 'task_creation' && data.pending_task) {
        // Creating a new task with all details
        const taskData = {
          title: data.pending_task.title,
          description: description || data.pending_task.description || '',
          ...updates, // priority, due_date, category, tags
        };
        console.log('📤 Creating new task:', taskData);  // DEBUG
        await onCreate(taskData);
        console.log('✅ Task created successfully!');  // DEBUG
      } else if (data.type === 'task_customization' && data.task_id) {
        // Updating existing task
        if (Object.keys(updates).length === 0 && !description) {
          onSkip();
          return;
        }
        const finalUpdates = { ...updates };
        if (description) {
          finalUpdates.description = description;
        }
        console.log('📤 Updating task:', finalUpdates);  // DEBUG
        await onUpdate(data.task_id, finalUpdates);
        console.log('✅ Task updated successfully!');  // DEBUG
      } else {
        onSkip();
      }
    } catch (error) {
      console.error('❌ Failed to save:', error);
      // Show error to user
      alert(`Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderAction = (action: QuickAction) => {
    switch (action.type) {
      case 'button_group':
        return (
          <PriorityButtonGroup
            options={action.options || []}
            onSelect={(value) => handleActionUpdate(action.id, value)}
          />
        );

      case 'date_picker':
        return (
          <DatePickerQuick
            quickOptions={action.quick_options || []}
            onSelect={(value) => handleActionUpdate(action.id, value)}
          />
        );

      case 'dropdown':
        return (
          <QuickActionDropdown
            options={(action.options as string[]) || []}
            onSelect={(value) => handleActionUpdate(action.id, value)}
            placeholder={action.placeholder}
          />
        );

      case 'text_input':
        return (
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={action.placeholder || 'Add description...'}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
        );

      case 'tag_input':
        return (
          <TagInput
            suggestions={action.suggestions}
            onTagsChange={(tags) => handleActionUpdate(action.id, tags)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg animate-fadeIn mt-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">✨ Customize your task:</h3>
      </div>

      <div className="space-y-4">
        {data.actions.map((action) => (
          <div key={action.id} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">{action.label}:</label>
            {renderAction(action)}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t-2 border-blue-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 ${
            isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md'
          }`}
        >
          {isSaving ? '⏳ Saving...' : '✅ Save Changes'}
        </button>

        <button
          onClick={onSkip}
          disabled={isSaving}
          className="px-6 py-3 rounded-lg font-bold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
        >
          ❌ Skip
        </button>
      </div>
    </div>
  );
}
