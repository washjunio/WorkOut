"use client";

import { useEffect } from 'react';
import type { ReactNode } from 'react';

// Componente para centralizar context providers (ex: auth, query client, theme).
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('SW registration failed', err);
      });
    }
  }, []);

  // TODO: envolver com futuro AuthProvider / QueryClientProvider / ThemeProvider.
  return <>{children}</>;
}
