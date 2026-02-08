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
    high: 'bg-gradient-to-r from-error-100 to-error-50 text-error-600 border-error-200 shadow-sm',
    medium: 'bg-gradient-to-r from-warning-100 to-warning-50 text-warning-600 border-warning-200 shadow-sm',
    low: 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-600 border-primary-200 shadow-sm',
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
  let color = 'bg-gradient-to-r from-surface-tertiary to-surface-secondary text-content-muted border-border';
  let label = due.toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  if (completed) {
    color = 'bg-gradient-to-r from-success-100 to-success-50 text-success-600 border-success-200 shadow-sm';
    label = '✓ ' + label;
  } else if (isOverdue) {
    color = 'bg-gradient-to-r from-error-100 to-error-50 text-error-600 border-error-200 shadow-sm';
    label = `⚠ ${t('overdue')}`;
  } else if (isDueToday) {
    color = 'bg-gradient-to-r from-warning-100 to-warning-50 text-warning-600 border-warning-200 shadow-sm';
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
    work: 'bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-600 border-indigo-200 shadow-sm',
    personal: 'bg-gradient-to-r from-accent-100 to-accent-50 text-accent-600 border-accent-200 shadow-sm',
    shopping: 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200 shadow-sm',
    health: 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-600 border-rose-200 shadow-sm',
    learning: 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 border-amber-200 shadow-sm',
  };

  const categoryLabels: Record<string, Record<string, string>> = {
    work: { en: 'Work', ur: 'کام' },
    personal: { en: 'Personal', ur: 'ذاتی' },
    shopping: { en: 'Shopping', ur: 'خریداری' },
    health: { en: 'Health', ur: 'صحت' },
    learning: { en: 'Learning', ur: 'سیکھنا' },
  };

  const key = category.toLowerCase();
  const color = categoryColors[key] || 'bg-gradient-to-r from-beige-100 to-beige-50 text-content-secondary border-beige-200 shadow-sm';
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
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 text-primary-600 shadow-sm',
        className
      )}
    >
      <span className="text-accent-500">#</span>
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:text-error-500 transition-colors"
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
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-content-muted">
          +{remainingCount} {t('more')}
        </span>
      )}
    </div>
  );
}
