'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 border border-accent-orange/30 hover:border-accent-orange/50 transition-all duration-200 hover:scale-105 shadow-brand-sm"
      title={language === 'en' ? 'Switch to Urdu' : 'English میں تبدیل کریں'}
    >
      {/* Language Icon */}
      <span className="text-lg">🌐</span>

      {/* Language Text */}
      <span className="text-sm font-semibold text-gray-200">
        {language === 'en' ? 'EN' : 'اردو'}
      </span>

      {/* Switch Arrow */}
      <span className="text-xs text-accent-orange">⇄</span>
    </button>
  );
}

/**
 * Compact version for header/navbar
 */
export function LanguageToggleCompact() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
      className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-orange/20 hover:bg-accent-orange/30 transition-colors border border-accent-orange/30"
      title={language === 'en' ? 'Switch to Urdu' : 'English میں تبدیل کریں'}
    >
      <span className="text-xs font-medium text-accent-orange">
        {language === 'en' ? 'EN' : 'UR'}
      </span>
    </button>
  );
}
