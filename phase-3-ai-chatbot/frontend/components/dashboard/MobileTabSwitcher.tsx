/**
 * MobileTabSwitcher Component - Metallic Chic Theme
 *
 * Tab navigation for mobile devices to switch between:
 * - Dashboard view
 * - Chatbot view
 */

'use client';

interface MobileTabSwitcherProps {
  activeTab: 'dashboard' | 'chatbot';
  onTabChange: (tab: 'dashboard' | 'chatbot') => void;
}

export function MobileTabSwitcher({ activeTab, onTabChange }: MobileTabSwitcherProps) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-navy-gradient border-b border-metallic-sky/30 shadow-blue">
      <div className="flex">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'bg-metallic-blue-light text-white border-b-4 border-metallic-blue'
              : 'bg-metallic-navy text-metallic-sky hover:bg-metallic-navy-light'
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
              ? 'bg-metallic-blue-light text-white border-b-4 border-metallic-blue'
              : 'bg-metallic-navy text-metallic-sky hover:bg-metallic-navy-light'
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
