/**
 * Priority Selector Component
 *
 * Beautiful button group to select task priority (Low/Medium/High)
 * with color-coded visual feedback.
 */

'use client';

import { Priority } from '@/lib/types';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
}

const priorities: { value: Priority; label: string; color: string; bg: string; border: string }[] = [
  {
    value: 'low',
    label: 'Low',
    color: 'text-gray-700',
    bg: 'bg-gray-100 hover:bg-gray-200',
    border: 'border-gray-400',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-orange-700',
    bg: 'bg-yellow-100 hover:bg-orange-100',
    border: 'border-yellow-400',
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-red-700',
    bg: 'bg-red-100 hover:bg-pink-100',
    border: 'border-red-400',
  },
];

export function PrioritySelector({ value, onChange, disabled = false }: PrioritySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
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
                ${isSelected ? `${priority.bg} ${priority.border} ${priority.color} shadow-sm` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
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

/**
 * Priority Badge - For displaying priority in task lists
 */
interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = priorities.find((p) => p.value === priority);

  if (!config) return null;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bg.replace('hover:', '')} ${config.color} ${config.border}
        border ${sizeClasses[size]}
      `}
    >
      {config.label}
    </span>
  );
}
