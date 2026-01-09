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
      <label className="block text-sm font-medium text-gray-700">
        Category
      </label>

      {!isCustom ? (
        <select
          value={value || ''}
          onChange={handleSelectChange}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none disabled:opacity-50"
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
  Work: 'bg-purple-100 text-purple-700 border-purple-200',
  Personal: 'bg-green-100 text-green-700 border-green-200',
  Shopping: 'bg-orange-100 text-orange-700 border-orange-200',
  Health: 'bg-pink-100 text-pink-700 border-pink-200',
  Learning: 'bg-blue-100 text-blue-700 border-blue-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function CategoryBadge({ category, onRemove }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] || 'bg-indigo-100 text-indigo-700 border-indigo-200';

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
