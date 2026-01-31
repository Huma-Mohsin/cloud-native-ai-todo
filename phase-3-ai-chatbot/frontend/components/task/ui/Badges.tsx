/**
 * Badge components for tasks - Priority, DueDate, Category
 *
 * Metallic Chic themed badges with appropriate colors
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Priority } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// Priority Badge
// ============================================================================

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { t } = useLanguage();

  const colors = {
    high: 'bg-error/20 text-error border-error/50',
    medium: 'bg-warning/20 text-warning border-warning/50',
    low: 'bg-metallic-sky/20 text-metallic-navy border-metallic-sky/50',
  };

  const labelKeys = {
    high: 'high' as const,
    medium: 'medium' as const,
    low: 'low' as const,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
        colors[priority],
        className
      )}
    >
      {t(labelKeys[priority])}
    </span>
  );
}

// ============================================================================
// Due Date Badge
// ============================================================================

interface DueDateBadgeProps {
  dueDate: string | null;
  completed: boolean;
  className?: string;
}

export function DueDateBadge({ dueDate, completed, className }: DueDateBadgeProps) {
  const { language, t } = useLanguage();
  if (!dueDate) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const isOverdue = due < now && !completed;
  const isDueToday =
    due.getDate() === now.getDate() &&
    due.getMonth() === now.getMonth() &&
    due.getFullYear() === now.getFullYear();

  const locale = language === 'ur' ? 'ur-PK' : 'en-US';
  let color = 'bg-metallic-sky/20 text-metallic-navy border-metallic-sky/50';
  let label = due.toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  if (completed) {
    color = 'bg-success/20 text-success border-success/50';
    label = '✓ ' + label;
  } else if (isOverdue) {
    color = 'bg-error/20 text-error border-error/50';
    label = `⚠ ${t('overdue')}`;
  } else if (isDueToday) {
    color = 'bg-warning/20 text-warning border-warning/50';
    label = `📅 ${t('today')}`;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
        color,
        className
      )}
    >
      {label}
    </span>
  );
}

// ============================================================================
// Category Badge
// ============================================================================

interface CategoryBadgeProps {
  category: string | null;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const { language } = useLanguage();
  if (!category) return null;

  const categoryColors: Record<string, string> = {
    work: 'bg-info/20 text-info border-info/50',
    personal: 'bg-metallic-blue/20 text-metallic-blue border-metallic-blue/50',
    shopping: 'bg-success/20 text-success border-success/50',
    health: 'bg-error/20 text-error border-error/50',
    learning: 'bg-warning/20 text-warning border-warning/50',
  };

  const categoryLabels: Record<string, Record<string, string>> = {
    work: { en: 'Work', ur: 'کام' },
    personal: { en: 'Personal', ur: 'ذاتی' },
    shopping: { en: 'Shopping', ur: 'خریداری' },
    health: { en: 'Health', ur: 'صحت' },
    learning: { en: 'Learning', ur: 'سیکھنا' },
  };

  const key = category.toLowerCase();
  const color = categoryColors[key] || 'bg-metallic-sky/20 text-metallic-navy border-metallic-sky/50';
  const label = categoryLabels[key]?.[language] || category;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
        color,
        className
      )}
    >
      {label}
    </span>
  );
}

// ============================================================================
// Tag Chip
// ============================================================================

interface TagChipProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

export function TagChip({ tag, onRemove, className }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white border border-metallic-sky/30 text-metallic-navy',
        className
      )}
    >
      <span className="text-metallic-blue">#</span>
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:text-error transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}

// ============================================================================
// Tag List (Read-only)
// ============================================================================

interface TagListProps {
  tags: string[];
  maxDisplay?: number;
  className?: string;
}

export function TagList({ tags, maxDisplay = 5, className }: TagListProps) {
  const { t } = useLanguage();
  if (!tags || tags.length === 0) return null;

  const displayTags = tags.slice(0, maxDisplay);
  const remainingCount = tags.length - maxDisplay;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {displayTags.map((tag, index) => (
        <TagChip key={index} tag={tag} />
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-metallic-navy/70">
          +{remainingCount} {t('more')}
        </span>
      )}
    </div>
  );
}
