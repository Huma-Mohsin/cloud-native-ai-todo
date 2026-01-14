/**
 * Filter Panel Component
 *
 * Additional filters for category, completion status, etc.
 */

'use client';

interface FilterPanelProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  availableCategories: string[];
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
}

export function FilterPanel({
  selectedCategory,
  onCategoryChange,
  availableCategories,
  showCompleted,
  onShowCompletedChange,
  showArchived,
  onShowArchivedChange,
}: FilterPanelProps) {
  return (
    <div className="p-3 sm:p-4 bg-white border border-gray-200 rounded-xl animate-in shadow-sm">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
        {/* Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Category:
          </label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white cursor-pointer hover:border-emerald-400 transition-colors"
          >
            <option value="">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes Row */}
        <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
          {/* Show Completed Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Show completed</span>
          </label>

          {/* Show Archived Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => onShowArchivedChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Show archived</span>
          </label>
        </div>

        {/* Reset Filters */}
        {(selectedCategory || showCompleted || showArchived) && (
          <button
            onClick={() => {
              onCategoryChange(null);
              onShowCompletedChange(false);
              onShowArchivedChange(false);
            }}
            className="sm:ml-auto text-sm text-emerald-600 hover:text-emerald-700 focus:outline-none self-start font-medium"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
