'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DropdownOption {
  value: string;
  label: string;
}

interface QuickActionDropdownProps {
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function QuickActionDropdown({ options, onSelect, placeholder }: QuickActionDropdownProps) {
  const { t } = useLanguage();
  const displayPlaceholder = placeholder || t('selectCategory');
  const [selected, setSelected] = useState<DropdownOption | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: DropdownOption) => {
    setSelected(option);
    onSelect(option.value);
    setIsOpen(false);
  };

  const getCategoryIcon = (value: string): string => {
    switch (value.toLowerCase()) {
      case 'work':
        return '💼';
      case 'personal':
        return '👤';
      case 'shopping':
        return '🛒';
      case 'health':
        return '💪';
      default:
        return '📁';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200 flex items-center justify-between ${
          selected
            ? 'bg-indigo-500 text-white border-indigo-600'
            : 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100'
        }`}
      >
        <span>
          {selected ? (
            <>
              {getCategoryIcon(selected.value)} {selected.label}
            </>
          ) : (
            <>{displayPlaceholder}</>
          )}
        </span>
        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-indigo-200 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-fadeIn">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors flex items-center"
            >
              <span className="mr-2">{getCategoryIcon(option.value)}</span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
