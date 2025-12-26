import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '../../providers';
import '../../styles/globals.css';

// Root layout define a estrutura HTML compartilhada e aplica estilos globais.
export const metadata: Metadata = {
  title: 'WorkOut PWA',
  description: 'PWA base para treinos, cardio e hábitos.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
