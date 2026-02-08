'use client';

import { useState } from 'react';
import { PriorityButtonGroup } from './PriorityButtonGroup';
import { DatePickerQuick } from './DatePickerQuick';
import { QuickActionDropdown } from './QuickActionDropdown';
import { TagInput } from './TagInput';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
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
        console.log('📤 Creating new task:', taskData);
        await onCreate(taskData);
        console.log('✅ Task created successfully!');
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
        console.log('📤 Updating task:', finalUpdates);
        await onUpdate(data.task_id, finalUpdates);
        console.log('✅ Task updated successfully!');
      } else {
        onSkip();
      }
    } catch (error) {
      console.error('❌ Failed to save:', error);
      alert(`${t('failedToSave')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            options={action.options || []}
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
            className="w-full px-4 py-2 border-2 border-brand-200 rounded-lg focus:border-brand-500 focus:outline-none transition-colors bg-white text-brand-950"
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
    <div className="bg-dark-700 rounded-lg p-4 border border-dark-700 mt-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-light-100 mb-2">{t('customizeTask')}</h3>
      </div>

      <div className="space-y-4">
        {data.actions.map((action) => (
          <div key={action.id} className="space-y-2">
            <label className="block text-sm font-semibold text-light-200">{action.label}:</label>
            {renderAction(action)}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-dark-700">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex-1 px-6 py-2 rounded-lg font-bold text-white transition-colors ${
            isSaving
              ? 'bg-primary-500/70 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600'
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin inline h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('saving')}
            </>
          ) : `💾 ${t('saveChanges')}`}
        </button>

        <button
          onClick={onSkip}
          disabled={isSaving}
          className="px-6 py-2 rounded-lg font-bold text-light-100 bg-dark-800 border border-dark-700 hover:bg-dark-900 transition-colors"
        >
          ❌ {t('skip')}
        </button>
      </div>
    </div>
  );
}
