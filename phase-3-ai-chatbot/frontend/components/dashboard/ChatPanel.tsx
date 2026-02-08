'use client';

import { ReactNode } from 'react';

interface ChatPanelProps {
  children: ReactNode;
}

export function ChatPanel({ children }: ChatPanelProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-beige-50 via-accent-50/30 to-beige-100">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
