'use client';

/**
 * Language Toggle Component
 *
 * Bonus Feature: Multi-language Support (+100 points)
 * Allows users to switch between English and Urdu
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-metallic-sky hover:border-metallic-blue transition-all duration-200 hover:scale-105 shadow-sm"
      title={language === 'en' ? 'Switch to Urdu' : 'English میں تبدیل کریں'}
    >
      {/* Language Icon */}
      <span className="text-lg">🌐</span>

      {/* Language Text */}
      <span className="text-sm font-semibold text-metallic-navy">
        {language === 'en' ? 'EN' : 'اردو'}
      </span>

      {/* Switch Arrow */}
      <span className="text-xs text-metallic-blue">⇄</span>
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
      className="flex items-center gap-1 px-2 py-1 rounded-md bg-metallic-sky/20 hover:bg-metallic-sky/40 transition-colors"
      title={language === 'en' ? 'Switch to Urdu' : 'English میں تبدیل کریں'}
    >
      <span className="text-xs font-medium text-metallic-navy">
        {language === 'en' ? 'EN' : 'UR'}
      </span>
    </button>
  );
}
