/**
 * Tags Input Component
 *
 * Input field that allows adding/removing multiple tags with chips/pills UI.
 */

'use client';

import { useState, KeyboardEvent } from 'react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagsInput({
  value,
  onChange,
  placeholder = 'Add tags (press Enter)',
  disabled = false,
  maxTags = 10,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();

      const newTag = inputValue.trim().toLowerCase();

      // Check if tag already exists
      if (value.includes(newTag)) {
        setInputValue('');
        return;
      }

      // Check max tags limit
      if (value.length >= maxTags) {
        setInputValue('');
        return;
      }

      // Add new tag
      onChange([...value, newTag]);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace when input is empty
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Tags {value.length > 0 && <span className="text-gray-500">({value.length}/{maxTags})</span>}
      </label>

      <div className="min-h-[42px] flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Tag chips */}
        {value.map((tag) => (
          <TagChip key={tag} tag={tag} onRemove={() => removeTag(tag)} disabled={disabled} />
        ))}

        {/* Input field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled || value.length >= maxTags}
          className="flex-1 min-w-[120px] px-2 py-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        Press Enter to add tags. Click × to remove.
      </p>
    </div>
  );
}

/**
 * Tag Chip - Individual tag display
 */
interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  disabled?: boolean;
}

function TagChip({ tag, onRemove, disabled = false }: TagChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium border border-blue-200">
      🏷️ {tag}
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
}

/**
 * Tag List - For displaying tags in task lists (read-only)
 */
interface TagListProps {
  tags: string[];
  maxDisplay?: number;
}

export function TagList({ tags, maxDisplay = 3 }: TagListProps) {
  if (tags.length === 0) return null;

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((tag) => (
        <TagChip key={tag} tag={tag} disabled />
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
