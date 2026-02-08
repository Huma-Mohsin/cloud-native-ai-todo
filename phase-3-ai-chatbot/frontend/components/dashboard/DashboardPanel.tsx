'use client';

import { ReactNode } from 'react';

interface DashboardPanelProps {
  children: ReactNode;
}

export function DashboardPanel({ children }: DashboardPanelProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-beige-50 via-beige-100/50 to-primary-50/30 border-r border-border">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
