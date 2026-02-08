'use client';

import { SmartFilterType } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface SmartFiltersProps {
  activeFilter: SmartFilterType;
  onChange: (filter: SmartFilterType) => void;
  counts?: {
    all: number;
    today: number;
    overdue: number;
    upcoming: number;
    completed: number;
  };
}

const filters: { value: SmartFilterType; labelKey: keyof import('@/lib/translations').Translations; icon: string }[] = [
  { value: 'all', labelKey: 'allTasks', icon: '📋' },
  { value: 'today', labelKey: 'today', icon: '📅' },
  { value: 'overdue', labelKey: 'overdue', icon: '⚠️' },
  { value: 'upcoming', labelKey: 'upcoming', icon: '📆' },
  { value: 'completed', labelKey: 'completed', icon: '✅' },
];

export function SmartFilters({ activeFilter, onChange, counts }: SmartFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const count = counts?.[filter.value] || 0;

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`
              flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl
              font-semibold text-sm md:text-base
              transition-all duration-200 shadow-sm
              ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-2 border-primary-400 shadow-primary'
                  : 'bg-white text-content border border-border hover:border-primary-300 hover:bg-primary-50'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            `}
          >
            <span className="text-lg md:text-xl">{filter.icon}</span>
            <span>{t(filter.labelKey)}</span>
            {counts && (
              <span
                className={`
                  px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs md:text-sm font-bold
                  ${isActive ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
