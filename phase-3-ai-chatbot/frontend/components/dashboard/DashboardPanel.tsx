/**
 * DashboardPanel Component - Metallic Chic Theme
 *
 * Left panel wrapper for TaskFlow Dashboard
 * - Contains the TaskDashboard component
 * - Metallic styling with gradient background
 */

'use client';

import { ReactNode } from 'react';

interface DashboardPanelProps {
  children: ReactNode;
}

export function DashboardPanel({ children }: DashboardPanelProps) {
  return (
    <div className="h-full flex flex-col bg-metallic-gradient border-r-2 border-metallic-blue">
      {/* Dashboard Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
