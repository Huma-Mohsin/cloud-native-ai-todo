'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface FilterPanelProps {
  category: string | null;
  showCompleted: boolean;
  onCategoryChange: (category: string | null) => void;
  onShowCompletedChange: (show: boolean) => void;
  onReset: () => void;
  availableCategories?: string[];
}

export function FilterPanel({
  category,
  showCompleted,
  onCategoryChange,
  onShowCompletedChange,
  onReset,
  availableCategories = [],
}: FilterPanelProps) {
  const { t } = useLanguage();
  const hasActiveFilters = category || showCompleted;

  return (
    <div className="bg-white border border-border rounded-xl p-4 space-y-4 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary-600">{t('advancedFilters')}</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-content-muted hover:text-error-500 transition-colors font-medium"
          >
            {t('reset')}
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-semibold text-content mb-2">
          {t('category')}
        </label>
        <select
          value={category || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-secondary text-content text-sm"
        >
          <option value="">{t('allCategories')}</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Show Completed */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show-completed"
          checked={showCompleted}
          onChange={(e) => onShowCompletedChange(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-white text-primary-500 focus:ring-primary-500"
        />
        <label htmlFor="show-completed" className="text-sm text-content cursor-pointer font-medium">
          {t('showCompletedTasks')}
        </label>
      </div>
    </div>
  );
}
