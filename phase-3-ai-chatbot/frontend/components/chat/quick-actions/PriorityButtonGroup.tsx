'use client';

import { useState } from 'react';

interface PriorityOption {
  value: string;
  label: string;
  icon?: string;
}

interface PriorityButtonGroupProps {
  options: PriorityOption[];
  onSelect: (value: string) => void;
}

export function PriorityButtonGroup({ options, onSelect }: PriorityButtonGroupProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    onSelect(value);
  };

  const getButtonColor = (value: string, isSelected: boolean) => {
    if (value === 'high') {
      return isSelected
        ? 'bg-red-500 text-white border-red-600'
        : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100';
    } else if (value === 'medium') {
      return isSelected
        ? 'bg-yellow-500 text-white border-yellow-600'
        : 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100';
    } else {
      return isSelected
        ? 'bg-green-500 text-white border-green-600'
        : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100';
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          className={`px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200 transform hover:scale-105 ${
            getButtonColor(option.value, selected === option.value)
          }`}
        >
          <span className="mr-2">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
