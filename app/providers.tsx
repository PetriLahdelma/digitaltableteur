'use client';
import { useEffect } from 'react';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { initI18n } from '../src/i18n';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initI18n();
  }, []);
  return <ThemeProvider>{children}</ThemeProvider>;
}
