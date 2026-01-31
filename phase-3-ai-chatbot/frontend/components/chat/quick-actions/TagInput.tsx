'use client';

import { useState, KeyboardEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TagInputProps {
  suggestions?: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagInput({ suggestions = [], onTagsChange }: TagInputProps) {
  const { t } = useLanguage();
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      onTagsChange(newTags);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    onTagsChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !tags.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Display tags */}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
            >
              🏷️ {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-purple-500 hover:text-purple-700 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={t('tagInputPlaceholder')}
          className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-purple-200 rounded-lg shadow-lg max-h-40 overflow-y-auto animate-fadeIn">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors text-sm"
              >
                🏷️ {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
