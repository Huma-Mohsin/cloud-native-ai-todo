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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-beige-100 to-beige-50">
      {/* Mobile Tab Switcher */}
      <MobileTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2-Column Container */}
      <div className="flex-1 flex overflow-hidden">
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
            border-l border-border
          `}
        >
          <ChatPanel>{chatbotContent}</ChatPanel>
        </div>
      </div>
    </div>
  );
}
