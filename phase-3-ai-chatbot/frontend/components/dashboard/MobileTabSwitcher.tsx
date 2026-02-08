'use client';

interface MobileTabSwitcherProps {
  activeTab: 'dashboard' | 'chatbot';
  onTabChange: (tab: 'dashboard' | 'chatbot') => void;
}

export function MobileTabSwitcher({ activeTab, onTabChange }: MobileTabSwitcherProps) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-border shadow-sm">
      <div className="flex">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'bg-primary-50 text-primary-600 border-b-4 border-primary-500'
              : 'bg-surface-secondary text-content-muted hover:bg-surface-tertiary'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg">📋</span>
            <span>Dashboard</span>
          </span>
        </button>
        <button
          onClick={() => onTabChange('chatbot')}
          className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'chatbot'
              ? 'bg-primary-50 text-primary-600 border-b-4 border-primary-500'
              : 'bg-surface-secondary text-content-muted hover:bg-surface-tertiary'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-lg">💬</span>
            <span>AI Chatbot</span>
          </span>
        </button>
      </div>
    </div>
  );
}
