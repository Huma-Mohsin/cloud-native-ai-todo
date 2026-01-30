'use client';

import { useState } from 'react';
import { addDays, addWeeks, format } from 'date-fns';

interface DatePickerQuickProps {
  quickOptions: string[];
  onSelect: (date: string) => void;
}

export function DatePickerQuick({ quickOptions, onSelect }: DatePickerQuickProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const getDateForOption = (option: string): string => {
    const now = new Date();
    switch (option) {
      case 'tomorrow':
        return addDays(now, 1).toISOString();
      case 'this_week':
        return addWeeks(now, 1).toISOString();
      case 'custom':
        return '';
      default:
        return now.toISOString();
    }
  };

  const handleQuickSelect = (option: string) => {
    if (option === 'custom') {
      setShowCustomPicker(true);
      setSelected(option);
    } else {
      const date = getDateForOption(option);
      setSelected(option);
      onSelect(date);
    }
  };

  const handleCustomDateSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      const date = new Date(dateValue);
      onSelect(date.toISOString());
      setShowCustomPicker(false);
    }
  };

  const getOptionLabel = (option: string): string => {
    switch (option) {
      case 'tomorrow':
        return '📅 Tomorrow';
      case 'this_week':
        return '📅 This Week';
      case 'custom':
        return '📅 Custom Date';
      default:
        return option;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {quickOptions.map((option) => (
          <button
            key={option}
            onClick={() => handleQuickSelect(option)}
            className={`px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200 transform hover:scale-105 ${
              selected === option
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
            }`}
          >
            {getOptionLabel(option)}
          </button>
        ))}
      </div>

      {showCustomPicker && (
        <div className="mt-3 animate-fadeIn">
          <input
            type="date"
            onChange={handleCustomDateSelect}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      )}
    </div>
  );
}
