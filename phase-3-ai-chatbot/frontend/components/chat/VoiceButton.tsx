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
      className={`px-4 py-3 rounded-2xl transition-all duration-200 font-semibold shadow-metallic hover:scale-105 ${
        isRecording
          ? 'bg-error text-white animate-pulse'
          : 'bg-metallic-sky-light text-metallic-navy hover:bg-metallic-sky border border-metallic-sky'
      }`}
    >
      {isRecording ? '⏹️' : '🎤'}
    </button>
  );
}
