/**
 * Category Input Component
 *
 * Dropdown with custom input option for task categories.
 * Shows existing categories and allows creating new ones.
 */

'use client';

import { useState, useEffect } from 'react';

interface CategoryInputProps {
  value: string | null;
  onChange: (category: string | null) => void;
  availableCategories?: string[];
  disabled?: boolean;
}

const defaultCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Other'];

export function CategoryInput({
  value,
  onChange,
  availableCategories = defaultCategories,
  disabled = false,
}: CategoryInputProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // Check if current value is custom
  useEffect(() => {
    if (value && !availableCategories.includes(value)) {
      setIsCustom(true);
      setCustomValue(value);
    }
  }, [value, availableCategories]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === '__custom__') {
      setIsCustom(true);
      setCustomValue('');
      onChange(null);
    } else if (selectedValue === '') {
      setIsCustom(false);
      onChange(null);
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onChange(newValue || null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Category
      </label>

      {!isCustom ? (
        <select
          value={value || ''}
          onChange={handleSelectChange}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 text-gray-200"
        >
          <option value="">No category</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="__custom__">+ Custom category...</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={customValue}
            onChange={handleCustomInput}
            placeholder="Enter custom category"
            disabled={disabled}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 bg-gray-800 text-gray-200 placeholder-gray-500"
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              setCustomValue('');
              onChange(null);
            }}
            disabled={disabled}
            className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Category Badge - For displaying category in task lists
 */
interface CategoryBadgeProps {
  category: string;
  onRemove?: () => void;
}

const categoryColors: Record<string, string> = {
  Work: 'bg-purple-900/30 text-purple-400 border-purple-500',
  Personal: 'bg-green-900/30 text-green-400 border-green-500',
  Shopping: 'bg-orange-900/30 text-orange-400 border-orange-500',
  Health: 'bg-pink-900/30 text-pink-400 border-pink-500',
  Learning: 'bg-blue-900/30 text-blue-400 border-blue-500',
  Other: 'bg-gray-700 text-gray-300 border-gray-500',
};

export function CategoryBadge({ category, onRemove }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] || 'bg-indigo-900/30 text-indigo-400 border-indigo-500';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}
    >
      📁 {category}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:text-gray-900 focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
