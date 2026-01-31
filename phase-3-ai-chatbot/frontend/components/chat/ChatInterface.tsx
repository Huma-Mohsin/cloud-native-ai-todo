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

      <div className="flex flex-col h-screen max-w-4xl mx-auto bg-metallic-gradient shadow-blue">
        {/* Header with Blue Metallic Theme */}
      <div className="bg-navy-gradient text-white p-6 shadow-metallic">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight blue-accent">✨ TaskFlow AI</h1>
            <p className="text-sm text-metallic-sky-light mt-1">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">{session.user.name || session.user.email}</p>
              <p className="text-xs text-metallic-sky">{session.user.email}</p>
            </div>
            {/* Language Toggle */}
            <LanguageToggleCompact />
            <button
              onClick={handleLogout}
              className="bg-metallic-blue-light/20 hover:bg-metallic-blue-light/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border border-metallic-blue-light/50"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area with Blue Metallic Theme */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-metallic-sky-light/30 metallic-scrollbar">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <div className="inline-block p-6 bg-white rounded-2xl shadow-blue border-2 border-metallic-sky">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl font-semibold text-metallic-navy mb-2 blue-accent">
                {language === 'en' ? 'Welcome to TaskFlow AI!' : 'ٹاسک فلو AI میں خوش آمدید!'}
              </p>
              <p className="text-sm text-metallic-navy-light mb-4">
                {language === 'en' ? 'Start chatting to manage your tasks' : 'اپنے کام منظم کرنے کے لیے چیٹنگ شروع کریں'}
              </p>
              <div className="text-left bg-metallic-sky-light/30 rounded-xl p-4 space-y-2 border border-metallic-sky">
                <p className="text-xs font-semibold text-metallic-blue mb-2">
                  {language === 'en' ? 'Try these commands:' : 'یہ کمانڈز آزمائیں:'}
                </p>
                <div className="space-y-1 text-sm text-metallic-navy-light">
                  <p className="flex items-center gap-2">
                    <span className="text-metallic-blue-light">→</span>
                    {language === 'en' ? '"Add a task to buy groceries"' : '"گروسری خریدنے کا ٹاسک شامل کریں"'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-metallic-blue-light">→</span>
                    {language === 'en' ? '"Show me all my tasks"' : '"مجھے اپنے تمام ٹاسک دکھائیں"'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-metallic-blue-light">→</span>
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
            <div className="bg-white rounded-2xl px-6 py-3 shadow-metallic border border-metallic-sky">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-metallic-blue-light rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-metallic-blue-light rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2.5 h-2.5 bg-metallic-blue-light rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-error text-error px-6 py-4 rounded-2xl shadow-md">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with Blue Metallic Theme */}
      <form onSubmit={handleSubmit} className="border-t-2 border-metallic-sky p-6 bg-white shadow-metallic">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${t('chatPlaceholder')} ✨`}
            className="flex-1 border-2 border-metallic-sky rounded-2xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-metallic-blue-light focus:border-transparent transition-all duration-200 text-metallic-navy placeholder-metallic-blue bg-metallic-sky-light/20"
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
            className="bg-blue-gradient text-white px-8 py-3 rounded-2xl hover:shadow-blue disabled:bg-metallic-sky disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-metallic hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? `⏳ ${t('recording')}` : `🚀 ${t('sendButton')}`}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}
