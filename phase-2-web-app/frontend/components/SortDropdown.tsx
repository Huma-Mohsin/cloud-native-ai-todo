/**
 * Sort Dropdown Component
 *
 * Dropdown to select task sorting option.
 */

'use client';

export type SortOption = 'created_at' | 'due_date' | 'priority' | 'position';

interface SortDropdownProps {
  value: SortOption;
  onChange: (sortBy: SortOption) => void;
  disabled?: boolean;
}

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: 'created_at', label: 'Date Created', icon: '📅' },
  { value: 'due_date', label: 'Due Date', icon: '⏰' },
  { value: 'priority', label: 'Priority', icon: '⭐' },
  { value: 'position', label: 'Custom Order', icon: '↕️' },
];

export function SortDropdown({ value, onChange, disabled = false }: SortDropdownProps) {
  const selectedOption = sortOptions.find((opt) => opt.value === value);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Sort by:
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          disabled={disabled}
          className="appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white cursor-pointer text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
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
