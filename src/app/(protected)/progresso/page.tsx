"use client";

import { useEffect, useState } from 'react';
import { obterProgressoSemanal } from '@/services/progresso.service';
import { Card, ProgressBar, Skeleton } from '@/components/ui';

type GrupoProgresso = {
  muscleGroup: string;
  alvoSeries: number;
  seriesExecutadas: number;
  percentual: number;
};

// Tela de historico e metricas de progresso.
export default function ProgressoPage() {
  const [grupos, setGrupos] = useState<GrupoProgresso[]>([]);
  const [cardio, setCardio] = useState<{ total: number; meta: number; percentual: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obterProgressoSemanal()
      .then((data) => {
        setGrupos(data.grupos);
        setCardio(data.cardio);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Progresso</h1>
        <p className="text-sm text-[--muted]">Resumo da semana</p>
      </header>

      {loading && (
        <div className="space-y-3">
          <Card className="space-y-2 fade-in">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
          </Card>
          {[1, 2, 3].map((k) => (
            <Card key={k} className="space-y-2 fade-in" style={{ animationDelay: `${k * 0.1}s` }}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </Card>
          ))}
        </div>
      )}

      {cardio && !loading && (
        <Card className="space-y-3 border-2 border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/5 to-transparent slide-up">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-[--muted] uppercase tracking-wide">Cardio semanal</div>
              <div className="text-2xl font-bold">
                <span className="text-[var(--accent)]">{cardio.total}</span>
                <span className="text-[--muted]"> / {cardio.meta} min</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[var(--accent)]">{cardio.percentual}%</div>
              <div className="text-xs text-[--muted]">completo</div>
            </div>
          </div>
          <ProgressBar value={cardio.percentual} max={100} />
        </Card>
      )}

      <div className="space-y-3">
        {grupos.map((g, index) => (
          <Card key={g.muscleGroup} className="space-y-3 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-base">{g.muscleGroup}</div>
                <div className="text-xs text-[--muted]">
                  {g.seriesExecutadas} de {g.alvoSeries} séries executadas
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--accent)]">{g.percentual}%</div>
              </div>
            </div>
            <ProgressBar value={g.percentual} max={100} />
          </Card>
        ))}
      </div>
    </section>
  );
}
