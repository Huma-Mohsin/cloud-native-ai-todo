/**
 * Date Picker Component
 *
 * Beautiful date/time picker for task due dates with quick presets.
 */

'use client';

import { useState } from 'react';

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  disabled?: boolean;
  showTime?: boolean;
}

export function DatePicker({ value, onChange, disabled = false, showTime = true }: DatePickerProps) {
  const [showPresets, setShowPresets] = useState(false);

  // Quick preset dates
  const presets = [
    { label: 'Today', getValue: () => getTodayEnd() },
    { label: 'Tomorrow', getValue: () => getTomorrowEnd() },
    { label: 'This Weekend', getValue: () => getWeekendEnd() },
    { label: 'Next Week', getValue: () => getNextWeekEnd() },
    { label: 'Next Month', getValue: () => getNextMonthEnd() },
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    onChange(preset.getValue());
    setShowPresets(false);
  };

  const handleClear = () => {
    onChange(null);
  };

  // Format value for display
  const displayValue = value ? formatDateForDisplay(value) : '';

  // Format value for input
  const inputValue = value ? formatDateForInput(value, showTime) : '';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Due Date {value && <span className="text-gray-500">(optional)</span>}
      </label>

      <div className="relative">
        {/* Date input field */}
        <input
          type={showTime ? 'datetime-local' : 'date'}
          value={inputValue}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          className="w-full px-3 py-2 pr-20 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-gray-800 text-gray-200"
        />

        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-300 focus:outline-none disabled:opacity-50"
              title="Clear date"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            disabled={disabled}
            className="px-2 py-1 text-xs text-emerald-400 hover:text-emerald-300 focus:outline-none disabled:opacity-50"
            title="Quick presets"
          >
            Presets
          </button>
        </div>

        {/* Presets dropdown */}
        {showPresets && !disabled && (
          <div className="absolute z-10 top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 focus:outline-none focus:bg-gray-700 first:rounded-t-lg last:rounded-b-lg text-gray-300"
              >
                <span className="font-medium">{preset.label}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {formatDateForDisplay(preset.getValue())}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Display formatted date */}
      {value && (
        <p className="text-xs text-gray-400">
          📅 {displayValue}
        </p>
      )}
    </div>
  );
}

// Helper functions

function getTodayEnd(): string {
  const date = new Date();
  date.setHours(23, 59, 59);
  return date.toISOString();
}

function getTomorrowEnd(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(23, 59, 59);
  return date.toISOString();
}

function getWeekendEnd(): string {
  const date = new Date();
  const day = date.getDay();
  const daysUntilSunday = 7 - day;
  date.setDate(date.getDate() + daysUntilSunday);
  date.setHours(23, 59, 59);
  return date.toISOString();
}

function getNextWeekEnd(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 59);
  return date.toISOString();
}

function getNextMonthEnd(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setHours(23, 59, 59);
  return date.toISOString();
}

function formatDateForInput(isoString: string, showTime: boolean): string {
  const date = new Date(isoString);

  if (showTime) {
    // Format: YYYY-MM-DDTHH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } else {
    // Format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

function formatDateForDisplay(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  // Check if today
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Check if tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  // Format date
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  // Format time
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  } else if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  } else {
    return `${dateStr} at ${timeStr}`;
  }
}

/**
 * Due Date Badge - For displaying due date in task lists
 */
interface DueDateBadgeProps {
  dueDate: string;
  completed: boolean;
}

export function DueDateBadge({ dueDate, completed }: DueDateBadgeProps) {
  const date = new Date(dueDate);
  const now = new Date();
  const isOverdue = date < now && !completed;
  const isDueToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  let colorClass = 'bg-gray-700 text-gray-300 border-gray-500';

  if (isOverdue) {
    colorClass = 'bg-red-900/30 text-red-400 border-red-500';
  } else if (isDueToday) {
    colorClass = 'bg-orange-900/30 text-orange-400 border-orange-500';
  } else if (completed) {
    colorClass = 'bg-green-900/30 text-green-400 border-green-500';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
      📅 {formatDateForDisplay(dueDate)}
    </span>
  );
}
