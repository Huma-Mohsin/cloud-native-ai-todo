/**
 * SplitScreenLayout Component - Metallic Chic Theme
 *
 * Main 2-column layout that combines:
 * - Dashboard Panel (LEFT side - 60%)
 * - Chatbot Panel (RIGHT side - 40%)
 * - Mobile tab switcher for small screens
 * - Responsive design with breakpoints
 */

'use client';

import { useState } from 'react';
import { DashboardPanel } from './DashboardPanel';
import { ChatPanel } from './ChatPanel';
import { MobileTabSwitcher } from './MobileTabSwitcher';

interface SplitScreenLayoutProps {
  dashboardContent: React.ReactNode;
  chatbotContent: React.ReactNode;
}

export function SplitScreenLayout({ dashboardContent, chatbotContent }: SplitScreenLayoutProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chatbot'>('dashboard');

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile Tab Switcher */}
      <MobileTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2-Column Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Both panels visible side by side */}
        {/* Mobile: Only active tab visible */}

        {/* LEFT PANEL - Dashboard (60%) */}
        <div
          className={`
            w-full lg:w-3/5 h-full
            ${activeTab === 'dashboard' ? 'block' : 'hidden'}
            lg:block
          `}
        >
          <DashboardPanel>{dashboardContent}</DashboardPanel>
        </div>

        {/* RIGHT PANEL - Chatbot (40%) */}
        <div
          className={`
            w-full lg:w-2/5 h-full
            ${activeTab === 'chatbot' ? 'block' : 'hidden'}
            lg:block
            border-l border-metallic-silver/20
          `}
        >
          <ChatPanel>{chatbotContent}</ChatPanel>
        </div>
      </div>
    </div>
  );
}
