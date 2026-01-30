'use client';

import { ChatMessage as ChatMessageType } from '@/services/chatService';
import { QuickActionButtons, QuickActionsData } from './quick-actions/QuickActionButtons';
import { getChatService } from '@/services/chatService';
import { useState } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
  userToken?: string;
  onTaskCreated?: (taskId: number, title: string) => void;
}

export function ChatMessage({ message, userToken, onTaskCreated }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [showQuickActions, setShowQuickActions] = useState(true);

  const handleCreateTask = async (taskData: Record<string, any>) => {
    if (!userToken) {
      console.error('No user token available for task creation');
      return;
    }

    try {
      const chatService = getChatService();
      const result = await chatService.createTaskWithDetails(taskData, userToken);
      console.log('✅ Task created with result:', result);

      // Notify parent component about task creation
      if (onTaskCreated && result.id) {
        onTaskCreated(result.id, taskData.title || 'Untitled Task');
      }

      setShowQuickActions(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const handleQuickUpdate = async (taskId: number, updates: Record<string, any>) => {
    if (!userToken) {
      console.error('No user token available for quick update');
      return;
    }

    try {
      const chatService = getChatService();
      const result = await chatService.quickUpdateTask(taskId, updates, userToken);
      console.log('✅ Task updated with result:', result);

      // Notify parent component about task update
      if (onTaskCreated && result.id) {
        const updateFields = Object.keys(updates).join(', ');
        onTaskCreated(result.id, `Task updated (${updateFields})`);
      }

      setShowQuickActions(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleSkip = () => {
    setShowQuickActions(false);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
      <div className="max-w-[85%] w-full">
        <div
          className={`rounded-2xl px-6 py-3 shadow-metallic transition-all duration-200 hover:shadow-blue ${
            isUser
              ? 'bg-blue-gradient text-white'
              : 'bg-white text-metallic-navy border-2 border-metallic-sky'
          }`}
        >
          <div className={`text-xs font-bold mb-2 ${isUser ? 'text-metallic-sky-light' : 'text-metallic-blue'}`}>
            {isUser ? '👤 You' : '🤖 AI Assistant'}
          </div>
          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        </div>

        {/* Render Quick Actions if present and not skipped */}
        {!isUser && message.quick_actions && showQuickActions && (
          <QuickActionButtons
            data={message.quick_actions as QuickActionsData}
            onCreate={handleCreateTask}
            onUpdate={handleQuickUpdate}
            onSkip={handleSkip}
          />
        )}
      </div>
    </div>
  );
}
