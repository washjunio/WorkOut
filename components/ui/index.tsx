import type { ReactNode } from 'react';

// UI primitives reutilizaveis; sem acesso direto a API.
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(15,76,92,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  className = '',
  loading = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; loading?: boolean }) {
  return (
    <button
      className={`rounded-[12px] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-white" />}
      {children}
    </button>
  );
}

export function SubtleButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[--secondary] transition hover:border-[var(--accent)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Stat({
  label,
  value,
  helper,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[--muted]">{label}</div>
      <div className="text-xl font-semibold text-[--text]">{value}</div>
      {helper ? <div className="text-xs text-[--muted]">{helper}</div> : null}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-[var(--border)]/40 ${className}`} style={{ minHeight: '1rem' }}>
      {/* Pulse background animation */}
      <div className="absolute inset-0 skeleton-pulse" />
      {/* Shimmer overlay animation */}
      <div className="absolute inset-0 shimmer-effect" />
    </div>
  );
}

export function Spinner({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <svg
        className="spinner text-[var(--accent)]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}) {
  const typeStyles = {
    success: 'bg-[var(--accent)] text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
          className="checkmark"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg slide-up ${typeStyles[type]} flex items-center gap-2 min-w-[200px] max-w-[90%] backdrop-blur-sm`}
    >
      {icons[type]}
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition shrink-0 ml-1"
          aria-label="Fechar"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-[var(--border)]/60">
      <div
        className="h-2 rounded-full bg-[var(--accent)] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// TODO: substituir por design system consistente (ex: Tailwind, Radix, etc.).
