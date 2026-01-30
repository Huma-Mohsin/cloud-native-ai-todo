'use client';

import { useState, useCallback } from 'react';
import { getChatService, ChatMessage } from '@/services/chatService';

interface UseChatProps {
  userId: string;
  token: string;
}

export function useChat({ userId, token }: UseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatService = getChatService();

  const sendMessage = useCallback(async (content: string, language?: string) => {
    if (!content.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(content, userId, token, conversationId, language);

      console.log('🔍 DEBUG: Full chat response:', response);  // DEBUG LOG

      if (response.success) {
        // Update conversation ID if new
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        console.log('✅ DEBUG: quick_actions in response?', response.quick_actions ? 'YES' : 'NO');  // DEBUG LOG
        if (response.quick_actions) {
          console.log('📋 DEBUG: quick_actions data:', response.quick_actions);  // DEBUG LOG
        }

        // Add assistant response with quick_actions if present
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          quick_actions: response.quick_actions,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      // Add error message to chat
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Error: ${errorMessage}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, chatService, userId, token]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  const addAssistantMessage = useCallback((content: string) => {
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content,
    };
    setMessages(prev => [...prev, assistantMessage]);
  }, []);

  return {
    messages,
    conversationId,
    isLoading,
    error,
    sendMessage,
    clearChat,
    addAssistantMessage,
  };
}
