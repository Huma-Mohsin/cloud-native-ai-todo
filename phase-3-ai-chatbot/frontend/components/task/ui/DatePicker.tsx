/**
 * Date Picker Component - Metallic Chic Theme
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
      <label className="block text-sm font-medium text-metallic-navy">
        Due Date {value && <span className="text-metallic-navy/50">(optional)</span>}
      </label>

      <div className="relative">
        {/* Date input field */}
        <input
          type={showTime ? 'datetime-local' : 'date'}
          value={inputValue}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          className="w-full px-3 py-2 pr-24 border border-metallic-sky/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-metallic-blue focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white text-metallic-navy transition-all duration-200"
        />

        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="px-2 py-1 text-xs text-metallic-navy/60 hover:text-error focus:outline-none disabled:opacity-50 transition-colors"
              title="Clear date"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            disabled={disabled}
            className="px-2 py-1 text-xs text-metallic-blue hover:text-metallic-blue-light focus:outline-none disabled:opacity-50 transition-colors"
            title="Quick presets"
          >
            Presets
          </button>
        </div>

        {/* Presets dropdown */}
        {showPresets && !disabled && (
          <div className="absolute z-10 top-full mt-1 w-full bg-white border border-metallic-sky/30 rounded-lg shadow-blue">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-white-light focus:outline-none focus:bg-white-light first:rounded-t-lg last:rounded-b-lg text-metallic-navy transition-colors"
              >
                <span className="font-medium">{preset.label}</span>
                <span className="ml-2 text-xs text-metallic-navy/60">
                  {formatDateForDisplay(preset.getValue())}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Display formatted date */}
      {value && (
        <p className="text-xs text-metallic-navy/70">
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
