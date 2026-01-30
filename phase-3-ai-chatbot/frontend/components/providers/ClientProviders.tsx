'use client';

/**
 * Client-side Providers Wrapper
 *
 * This component wraps all client-side context providers
 * to keep the root layout as a server component
 */

import { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
