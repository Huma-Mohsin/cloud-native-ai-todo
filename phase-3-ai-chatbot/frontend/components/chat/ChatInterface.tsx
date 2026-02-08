'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ReminderContainer } from '@/components/notifications/ReminderContainer';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import type { Session } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggleCompact } from './LanguageToggle';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { VoiceButton } from './VoiceButton';

interface ChatInterfaceProps {
  session: Session;
}

export function ChatInterface({ session }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { language, t } = useLanguage();

  // Extract user ID and token from session
  const userId = session.user.id;
  const token = session.session.token;

  const { messages, isLoading, error, sendMessage, addAssistantMessage } = useChat({ userId, token });

  const { isRecording, isSupported, startRecording, stopRecording } = useVoiceRecording({
    language,
    onTranscript: (text: string) => setInput(text),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTaskCreated = (taskId: number, title: string) => {
    const successMessage = language === 'ur'
      ? `✅ ٹاسک "${title}" کامیابی سے بنایا گیا (ID: ${taskId})!\n\nآپ یہ بھی کر سکتے ہیں:\n- اسے اپ ڈیٹ کریں: "ٹاسک ${taskId} کی ترجیح زیادہ کریں"\n- مکمل کریں: "ٹاسک ${taskId} مکمل کریں"\n- حذف کریں: "ٹاسک ${taskId} حذف کریں"`
      : `✅ Task "${title}" created successfully (ID: ${taskId})!\n\nYou can now:\n- Update it: "Update task ${taskId} priority to high"\n- Complete it: "Complete task ${taskId}"\n- Delete it: "Delete task ${taskId}"`;
    addAssistantMessage(successMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input, language);
    setInput('');

    // Auto-focus input field after sending message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      {/* Reminder Notifications */}
      <ReminderContainer userId={userId} token={token} />

      <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="bg-white p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gradient">TaskFlow AI</h1>
              <p className="text-sm text-content-muted mt-1">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-content">{session.user.name || session.user.email}</p>
                <p className="text-xs text-content-muted">{session.user.email}</p>
              </div>
              {/* Language Toggle */}
              <LanguageToggleCompact />
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-primary-lg px-4 py-2 rounded-lg text-sm font-medium transition-all text-white"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-secondary custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <div className="inline-block p-6 bg-white rounded-2xl shadow-md border border-border">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-xl font-semibold text-content mb-2">
                {language === 'en' ? 'Welcome to TaskFlow AI!' : 'ٹاسک فلو AI میں خوش آمدید!'}
              </p>
              <p className="text-sm text-content-muted mb-4">
                {language === 'en' ? 'Start chatting to manage your tasks' : 'اپنے کام منظم کرنے کے لیے چیٹنگ شروع کریں'}
              </p>
              <div className="text-left bg-surface-tertiary rounded-xl p-4 space-y-2 border border-border-light">
                <p className="text-xs font-semibold text-primary-500 mb-2">
                  {language === 'en' ? 'Try these commands:' : 'یہ کمانڈز آزمائیں:'}
                </p>
                <div className="space-y-1 text-sm text-content-secondary">
                  <p className="flex items-center gap-2">
                    <span className="text-primary-500">→</span>
                    {language === 'en' ? '"Add a task to buy groceries"' : '"گروسری خریدنے کا ٹاسک شامل کریں"'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary-500">→</span>
                    {language === 'en' ? '"Show me all my tasks"' : '"مجھے اپنے تمام ٹاسک دکھائیں"'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-primary-500">→</span>
                    {language === 'en' ? '"Mark task 1 as complete"' : '"ٹاسک 1 کو مکمل کریں"'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            userToken={token}
            onTaskCreated={handleTaskCreated}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-border">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-error-50 border border-error-500/30 text-error-500 px-6 py-4 rounded-2xl">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4 bg-white">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-1 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-content placeholder-content-light bg-surface-secondary"
            disabled={isLoading}
          />
          <VoiceButton
            isRecording={isRecording}
            isSupported={isSupported}
            onStart={startRecording}
            onStop={stopRecording}
          />
          <button
            type="submit"
            disabled={isLoading || isRecording || !input.trim()}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl hover:shadow-primary-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-primary"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin inline h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('sending')}
              </>
            ) : t('sendButton')}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}
