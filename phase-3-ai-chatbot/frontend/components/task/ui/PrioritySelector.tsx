/**
 * Priority Selector Component - Metallic Chic Theme
 *
 * Beautiful button group to select task priority (Low/Medium/High)
 * with metallic color-coded visual feedback.
 */

'use client';

import { Priority } from '@/lib/types';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
}

const priorities: {
  value: Priority;
  label: string;
  color: string;
  bg: string;
  border: string;
  unselectedBg: string;
  unselectedBorder: string;
  unselectedColor: string;
}[] = [
  {
    value: 'low',
    label: 'Low',
    color: 'text-metallic-navy',
    bg: 'bg-metallic-sky/20 hover:bg-metallic-sky/30',
    border: 'border-metallic-sky',
    unselectedBg: 'bg-white hover:bg-white-light',
    unselectedBorder: 'border-metallic-sky/30',
    unselectedColor: 'text-metallic-navy/70',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-warning',
    bg: 'bg-warning/20 hover:bg-warning/30',
    border: 'border-warning',
    unselectedBg: 'bg-warning/10 hover:bg-warning/20',
    unselectedBorder: 'border-warning/30',
    unselectedColor: 'text-warning/70',
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-error',
    bg: 'bg-error/20 hover:bg-error/30',
    border: 'border-error',
    unselectedBg: 'bg-error/10 hover:bg-error/20',
    unselectedBorder: 'border-error/30',
    unselectedColor: 'text-error/70',
  },
];

export function PrioritySelector({ value, onChange, disabled = false }: PrioritySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-metallic-navy">
        Priority
      </label>
      <div className="flex gap-2">
        {priorities.map((priority) => {
          const isSelected = value === priority.value;
          return (
            <button
              key={priority.value}
              type="button"
              onClick={() => onChange(priority.value)}
              disabled={disabled}
              className={`
                flex-1 px-4 py-2 rounded-lg border-2 font-medium text-sm
                transition-all duration-200 ease-in-out
                ${
                  isSelected
                    ? `${priority.bg} ${priority.border} ${priority.color} shadow-metallic`
                    : `${priority.unselectedBg} ${priority.unselectedBorder} ${priority.unselectedColor}`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-metallic-blue focus:ring-offset-metallic-navy-dark
              `}
            >
              {priority.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
