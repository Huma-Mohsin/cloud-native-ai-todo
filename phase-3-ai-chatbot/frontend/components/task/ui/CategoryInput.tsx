/**
 * Category Input Component - Metallic Chic Theme
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
      <label className="block text-sm font-medium text-metallic-navy">
        Category
      </label>

      {!isCustom ? (
        <select
          value={value || ''}
          onChange={handleSelectChange}
          disabled={disabled}
          className="w-full px-3 py-2 border border-metallic-sky/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-metallic-blue focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white text-metallic-navy transition-all duration-200"
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
            className="flex-1 px-3 py-2 border border-metallic-sky/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-metallic-blue focus:border-transparent disabled:opacity-50 bg-white text-metallic-navy placeholder-metallic-sky/50 transition-all duration-200"
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
            className="px-3 py-2 text-sm text-metallic-navy/60 hover:text-error focus:outline-none disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
