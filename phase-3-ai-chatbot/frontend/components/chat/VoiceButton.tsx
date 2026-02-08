'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceButtonProps {
  isRecording: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({ isRecording, isSupported, onStart, onStop }: VoiceButtonProps) {
  const { t } = useLanguage();

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={isRecording ? onStop : onStart}
      title={isRecording ? t('stopRecording') : t('voiceInput')}
      className={`px-4 py-3 rounded-2xl transition-all duration-200 font-semibold shadow-brand-sm hover:scale-105 ${
        isRecording
          ? 'bg-error text-white animate-pulse'
          : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
      }`}
    >
      {isRecording ? '⏹️' : '🎤'}
    </button>
  );
}
