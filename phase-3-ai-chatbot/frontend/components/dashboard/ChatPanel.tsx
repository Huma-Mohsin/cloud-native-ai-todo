/**
 * ChatPanel Component - Metallic Chic Theme
 *
 * Right panel wrapper for AI Chatbot interface
 * - Contains the existing ChatInterface component
 * - Metallic styling with gradient background
 */

'use client';

import { ReactNode } from 'react';

interface ChatPanelProps {
  children: ReactNode;
}

export function ChatPanel({ children }: ChatPanelProps) {
  return (
    <div className="h-full flex flex-col bg-metallic-gradient">
      {/* Chat Content - ChatInterface has its own header */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
