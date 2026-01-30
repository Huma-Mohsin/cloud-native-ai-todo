/**
 * Tags Input Component - Metallic Chic Theme
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
      <label className="block text-sm font-medium text-metallic-navy">
        Tags {value.length > 0 && <span className="text-metallic-navy/50">({value.length}/{maxTags})</span>}
      </label>

      <div className="min-h-[42px] flex flex-wrap gap-2 p-2 border border-metallic-sky/30 rounded-lg focus-within:ring-2 focus-within:ring-metallic-blue focus-within:border-transparent bg-white transition-all duration-200">
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
          className="flex-1 min-w-[120px] px-2 py-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-white text-metallic-navy placeholder-metallic-sky/50"
        />
      </div>

      {/* Helper text */}
      <p className="text-xs text-metallic-navy/70">
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
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-metallic-sky/30 text-metallic-navy rounded-md text-xs font-medium transition-all duration-200 hover:border-metallic-blue">
      <span className="text-metallic-blue">#</span>
      {tag}
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-metallic-navy/60 hover:text-error focus:outline-none transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}
