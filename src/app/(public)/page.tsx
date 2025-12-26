import Link from 'next/link';

// Pagina de entrada publica com mensagem inicial.
export default function PublicLandingPage() {
  return (
    <section className="p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold">WorkOut PWA</h1>
        <p className="text-sm text-[--muted]">
          Base pronta para evoluir funcionalidades de treinos, cardio e hábitos.
        </p>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-[--muted]">Acesso rápido às telas implementadas:</div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/hoje"
            className="rounded bg-[var(--accent)] px-3 py-2 text-black text-sm font-semibold"
          >
            Ir para Hoje
          </Link>
          <Link
            href="/plano"
            className="rounded border border-[var(--accent)] px-3 py-2 text-sm text-[--accent]"
          >
            Ir para Plano
          </Link>
          <Link
            href="/progresso"
            className="rounded border border-[var(--accent)] px-3 py-2 text-sm text-[--accent]"
          >
            Ir para Progresso
          </Link>
        </div>
      </div>
    </section>
  );
}
