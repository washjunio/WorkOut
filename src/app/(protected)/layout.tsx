"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/hoje', label: 'Hoje', icon: 'ri-pulse-line' },
  { href: '/plano', label: 'Plano', icon: 'ri-calendar-2-line' },
  { href: '/progresso', label: 'Progresso', icon: 'ri-line-chart-line' },
  { href: '/configuracoes', label: 'Config', icon: 'ri-settings-3-line' },
];

// Layout protegido; conteudo so deve ser exibido para usuarios autenticados.
// A protecao real deve combinar middleware + providers de sessao.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[--text]">
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-4">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex max-w-3xl items-center justify-around py-2 text-xs">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex min-w-[64px] flex-col items-center gap-1 px-3 py-2 transition-all ${
                  active
                    ? 'text-[var(--accent)]'
                    : 'text-[--muted] hover:text-[--text] active:scale-95'
                }`}
              >
                {active && (
                  <div className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
                )}
                <i className={`${item.icon} text-xl`} aria-hidden />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
