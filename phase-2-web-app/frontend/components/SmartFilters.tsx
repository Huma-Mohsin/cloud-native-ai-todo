/**
 * Smart Filters Component
 *
 * Tab-based smart filters for quick task filtering (All, Today, Overdue, Upcoming).
 */

'use client';

export type SmartFilterType = 'all' | 'today' | 'overdue' | 'upcoming' | 'completed';

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

const filters: { value: SmartFilterType; label: string; icon: string; color: string }[] = [
  { value: 'all', label: 'All Tasks', icon: '📋', color: 'text-gray-700' },
  { value: 'today', label: 'Today', icon: '📅', color: 'text-blue-700' },
  { value: 'overdue', label: 'Overdue', icon: '⚠️', color: 'text-red-700' },
  { value: 'upcoming', label: 'Upcoming', icon: '📆', color: 'text-purple-700' },
  { value: 'completed', label: 'Completed', icon: '✅', color: 'text-green-700' },
];

export function SmartFilters({ activeFilter, onChange, counts }: SmartFiltersProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const count = counts?.[filter.value] || 0;

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`
              flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-base
              transition-all duration-200 whitespace-nowrap
              ${
                isActive
                  ? 'bg-gray-800 text-white border-2 border-emerald-400 shadow-lg'
                  : 'bg-gray-800 text-gray-300 border-2 border-gray-600 hover:border-emerald-400 hover:bg-gray-600'
              }
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
            `}
          >
            <span className="text-xl">{filter.icon}</span>
            <span>{filter.label}</span>
            {counts && (
              <span
                className={`
                  px-2.5 py-1 rounded-full text-sm font-bold
                  ${isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-700 text-gray-300'}
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
