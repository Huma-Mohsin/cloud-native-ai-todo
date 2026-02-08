'use client';

import { SortOption } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface SortDropdownProps {
  value: SortOption;
  onChange: (sortBy: SortOption) => void;
  disabled?: boolean;
}

const sortOptions: { value: SortOption; labelKey: keyof import('@/lib/translations').Translations; icon: string }[] = [
  { value: 'created_at', labelKey: 'dateCreated', icon: '📅' },
  { value: 'due_date', labelKey: 'dueDate', icon: '⏰' },
  { value: 'priority', labelKey: 'priority', icon: '⭐' },
  { value: 'position', labelKey: 'customOrder', icon: '↕️' },
];

export function SortDropdown({ value, onChange, disabled = false }: SortDropdownProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold text-content whitespace-nowrap">
        {t('sortBy')}:
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          disabled={disabled}
          className="appearance-none pl-3 pr-10 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white cursor-pointer text-sm hover:border-primary-300 transition-all duration-200 text-content shadow-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {t(option.labelKey)}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
