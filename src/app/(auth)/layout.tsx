import type { ReactNode } from 'react';

// Layout exclusivo para fluxos de autenticacao (login, recuperar senha, signup futuro).
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      {/* TODO: adicionar container centralizado e branding. */}
      {children}
    </main>
  );
}
