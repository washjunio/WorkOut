import type { ReactNode } from 'react';

// Layout dedicado a rotas publicas; ideal para barras simples, SEO aberto e temas publicos.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      {/* TODO: adicionar Header/Footer publicos compartilhados. */}
      {children}
    </main>
  );
}
