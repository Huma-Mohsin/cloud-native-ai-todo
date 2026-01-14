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

const priorities: { value: Priority; label: string; color: string; bg: string; border: string; unselectedBg: string; unselectedBorder: string; unselectedColor: string }[] = [
  {
    value: 'low',
    label: 'Low',
    color: 'text-gray-300',
    bg: 'bg-gray-700 hover:bg-gray-600',
    border: 'border-gray-400',
    unselectedBg: 'bg-gray-700 hover:bg-gray-600',
    unselectedBorder: 'border-gray-500',
    unselectedColor: 'text-gray-300',
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-yellow-300',
    bg: 'bg-yellow-900/50 hover:bg-yellow-800/60',
    border: 'border-yellow-400',
    unselectedBg: 'bg-yellow-900/30 hover:bg-yellow-800/40',
    unselectedBorder: 'border-yellow-600/50',
    unselectedColor: 'text-yellow-400',
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-red-300',
    bg: 'bg-red-900/50 hover:bg-red-800/60',
    border: 'border-red-400',
    unselectedBg: 'bg-red-900/30 hover:bg-red-800/40',
    unselectedBorder: 'border-red-600/50',
    unselectedColor: 'text-red-400',
  },
];

export function PrioritySelector({ value, onChange, disabled = false }: PrioritySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
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
                ${isSelected ? `${priority.bg} ${priority.border} ${priority.color} shadow-sm` : `${priority.unselectedBg} ${priority.unselectedBorder} ${priority.unselectedColor}`}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
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
