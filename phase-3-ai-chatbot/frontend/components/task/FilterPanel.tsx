/**
 * FilterPanel Component - Metallic Chic Theme
 *
 * Advanced filter panel for category and completed filters.
 */

'use client';

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
  const hasActiveFilters = category || showCompleted;

  return (
    <div className="bg-white border border-metallic-sky/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-metallic-blue">Advanced Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-metallic-navy/60 hover:text-error transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-metallic-navy mb-2">
          Category
        </label>
        <select
          value={category || ''}
          onChange={(e) => onCategoryChange(e.target.value || null)}
          className="w-full px-3 py-2 border border-metallic-sky/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-metallic-blue focus:border-transparent bg-white text-metallic-navy text-sm"
        >
          <option value="">All categories</option>
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
          className="h-4 w-4 rounded border-metallic-sky/30 text-metallic-blue focus:ring-metallic-blue focus:ring-offset-metallic-navy-dark"
        />
        <label htmlFor="show-completed" className="text-sm text-metallic-navy cursor-pointer">
          Show completed tasks
        </label>
      </div>
    </div>
  );
}
