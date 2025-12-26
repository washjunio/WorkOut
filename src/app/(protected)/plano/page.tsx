"use client";

import { useEffect, useState } from 'react';
import { adicionarExercicioAoPlano, obterPlanoSemanal, type PlanoEntradaPayload } from '@/services/plano.service';
import { Card, Skeleton, Button, SubtleButton, Toast } from '@/components/ui';

type PlanoDia = Awaited<ReturnType<typeof obterPlanoSemanal>>[number];

// Tela para planejar treinos futuros e dividir por grupos musculares.
export default function PlanoPage() {
  const [plano, setPlano] = useState<PlanoDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState<PlanoEntradaPayload>({
    weekDay: new Date().getDay(),
    exerciseName: '',
    muscleGroup: 'Peito',
    tipoTreino: 'FORCA',
    executionMode: 'REPETICOES',
    targetSets: 3,
    targetReps: 10,
    targetDuration: 60,
    restSeconds: 90,
    weeklyTargetMinutes: 60,
  });

  useEffect(() => {
    obterPlanoSemanal()
      .then(setPlano)
      .finally(() => setLoading(false));
  }, []);

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const validarFormulario = (): boolean => {
    if (!form.exerciseName.trim()) {
      alert('Nome do exercício é obrigatório');
      return false;
    }

    if (form.tipoTreino === 'FORCA' || form.tipoTreino === 'PESO_CORPO') {
      if (!form.targetSets || form.targetSets < 1) {
        alert('Número de séries é obrigatório');
        return false;
      }
      if (!form.targetReps || form.targetReps < 1) {
        alert('Repetições por série é obrigatório');
        return false;
      }
      if (form.restSeconds === undefined || form.restSeconds < 0) {
        alert('Descanso entre séries é obrigatório');
        return false;
      }
    } else if (form.tipoTreino === 'TEMPO') {
      if (!form.targetSets || form.targetSets < 1) {
        alert('Número de séries é obrigatório');
        return false;
      }
      if (!form.targetDuration || form.targetDuration < 1) {
        alert('Tempo por série é obrigatório');
        return false;
      }
      if (form.restSeconds === undefined || form.restSeconds < 0) {
        alert('Descanso entre séries é obrigatório');
        return false;
      }
    } else if (form.tipoTreino === 'CARDIO') {
      if (!form.weeklyTargetMinutes || form.weeklyTargetMinutes < 1) {
        alert('Meta semanal de minutos é obrigatória');
        return false;
      }
    }

    return true;
  };

  const resetarFormulario = () => {
    setForm({
      weekDay: new Date().getDay(),
      exerciseName: '',
      muscleGroup: 'Peito',
      tipoTreino: 'FORCA',
      executionMode: 'REPETICOES',
      targetSets: 3,
      targetReps: 10,
      targetDuration: 60,
      restSeconds: 90,
      weeklyTargetMinutes: 60,
    });
  };

  return (
    <>
      <section className="space-y-6">
        <header className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Plano semanal</h1>
              <p className="text-sm text-[--muted]">Monte os treinos da semana</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="shrink-0">
              + Adicionar
            </Button>
          </div>
        </header>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <Card key={k} className="space-y-3 fade-in" style={{ animationDelay: `${k * 0.1}s` }}>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {plano.map((dia, index) => (
              <Card key={dia.id} className="space-y-3 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{diasSemana[dia.weekDay]}</div>
                  <div className="text-sm text-[--muted]">{dia.name}</div>
                </div>
                <div className="text-xs text-[--muted]">{dia.exercises.length} exercícios</div>
              </div>
              <div className="space-y-2">
                {dia.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 space-y-2 transition hover:border-[var(--accent)]/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base">{ex.exercise.name}</div>
                        <div className="text-xs text-[--muted] mt-0.5">{ex.exercise.muscleGroup}</div>
                      </div>
                      <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                        {ex.tipoTreino.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[--muted] pt-1 border-t border-[var(--border)]/50">
                      {ex.tipoTreino === 'CARDIO' ? (
                        <span className="font-medium text-[--text]">
                          Meta: <span className="text-[var(--accent)]">{ex.weeklyTargetMinutes ?? 0} min/semana</span>
                        </span>
                      ) : (
                        <>
                          <span>
                            <span className="font-medium text-[--text]">{ex.targetSets ?? '--'}</span> séries
                          </span>
                          {ex.tipoTreino === 'TEMPO' ? (
                            <span>
                              <span className="font-medium text-[--text]">{ex.targetDuration ?? '--'}</span>s por série
                            </span>
                          ) : (
                            <span>
                              <span className="font-medium text-[--text]">{ex.targetReps ?? '--'}</span> reps
                            </span>
                          )}
                          {ex.restSeconds && (
                            <span>
                              Descanso: <span className="font-medium text-[--text]">{ex.restSeconds}s</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
              ))}
            </div>
          </Card>
            ))}
          </div>
        )}
      </section>

      {showForm && (
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm fade-in">
        <div className="absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl bg-[var(--surface)] p-6 pb-24 shadow-2xl slide-up overflow-y-auto">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Adicionar exercício ao plano</h2>
              <p className="text-sm text-[--muted]">Defina o dia e o tipo de execução</p>
            </div>
            <button
              onClick={() => {
                setShowForm(false);
                resetarFormulario();
              }}
              className="text-[--muted]"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-[--muted]">
              Dia da semana
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                value={form.weekDay}
                onChange={(e) => setForm((f) => ({ ...f, weekDay: Number(e.target.value) }))}
              >
                {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(
                  (d, idx) => (
                    <option key={d} value={idx}>
                      {d}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="text-sm text-[--muted]">
              Grupo muscular
              <select
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                value={form.muscleGroup}
                onChange={(e) => setForm((f) => ({ ...f, muscleGroup: e.target.value }))}
              >
                {['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Core', 'Cardio'].map(
                  (g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="text-sm text-[--muted] md:col-span-2">
              Nome do exercício
              <input
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                value={form.exerciseName}
                onChange={(e) => setForm((f) => ({ ...f, exerciseName: e.target.value }))}
              />
            </label>
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-sm text-[--muted]">Tipo de treino</div>
            <div className="flex flex-wrap gap-2">
              {(['FORCA', 'PESO_CORPO', 'TEMPO', 'CARDIO'] as const).map((tipo) => {
                const labels: Record<typeof tipo, string> = {
                  FORCA: 'Força',
                  PESO_CORPO: 'Peso do corpo',
                  TEMPO: 'Tempo',
                  CARDIO: 'Cardio',
                };
                return (
                  <SubtleButton
                    key={tipo}
                    className={`px-4 py-2 ${form.tipoTreino === tipo ? 'border-[var(--accent)] text-[--accent]' : ''}`}
                    onClick={() => {
                      // Mapear tipoTreino para executionMode
                      const executionModeMap: Record<typeof tipo, 'REPETICOES' | 'TEMPO' | 'CARDIO'> = {
                        FORCA: 'REPETICOES',
                        PESO_CORPO: 'REPETICOES',
                        TEMPO: 'TEMPO',
                        CARDIO: 'CARDIO',
                      };
                      setForm((f) => ({
                        ...f,
                        tipoTreino: tipo,
                        executionMode: executionModeMap[tipo],
                        // Limpar campos não relevantes
                        targetReps: tipo === 'TEMPO' || tipo === 'CARDIO' ? undefined : f.targetReps,
                        targetDuration: tipo !== 'TEMPO' ? undefined : f.targetDuration,
                        weeklyTargetMinutes: tipo !== 'CARDIO' ? undefined : f.weeklyTargetMinutes,
                        targetSets: tipo === 'CARDIO' ? undefined : f.targetSets,
                        restSeconds: tipo === 'CARDIO' ? undefined : f.restSeconds,
                      }));
                    }}
                    type="button"
                  >
                    {labels[tipo]}
                  </SubtleButton>
                );
              })}
            </div>
          </div>

          {/* Campos para FORCA e PESO_CORPO */}
          {(form.tipoTreino === 'FORCA' || form.tipoTreino === 'PESO_CORPO') && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="text-sm text-[--muted]">
                Número de séries *
                <input
                  type="number"
                  min="1"
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                  value={form.targetSets ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, targetSets: Number(e.target.value) }))}
                />
              </label>
              <label className="text-sm text-[--muted]">
                Repetições por série *
                <input
                  type="number"
                  min="1"
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                  value={form.targetReps ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, targetReps: Number(e.target.value) }))}
                />
              </label>
              <label className="text-sm text-[--muted]">
                Descanso entre séries (s) *
                <input
                  type="number"
                  min="0"
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                  value={form.restSeconds ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, restSeconds: Number(e.target.value) }))}
                />
              </label>
            </div>
          )}

          {/* Campos para TEMPO */}
          {form.tipoTreino === 'TEMPO' && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="text-sm text-[--muted]">
                Número de séries *
                <input
                  type="number"
                  min="1"
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                  value={form.targetSets ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, targetSets: Number(e.target.value) }))}
                />
              </label>
              <label className="text-sm text-[--muted]">
                Tempo por série (s) *
                <input
                  type="number"
                  min="1"
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                  value={form.targetDuration ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetDuration: Number(e.target.value) }))
                  }
                />
              </label>
              <label className="text-sm text-[--muted]">
                Descanso entre séries (s) *
                <input
                  type="number"
                  min="0"
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                  value={form.restSeconds ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, restSeconds: Number(e.target.value) }))}
                />
              </label>
            </div>
          )}

          {/* Campos para CARDIO */}
          {form.tipoTreino === 'CARDIO' && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-[--muted]">
                Meta semanal de minutos *
                <input
                  type="number"
                  min="1"
                  required
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
                  value={form.weeklyTargetMinutes ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, weeklyTargetMinutes: Number(e.target.value) }))
                  }
                />
              </label>
            </div>
          )}

          <div className="mt-6 mb-2 flex justify-end gap-2 sticky bottom-0 bg-[var(--surface)] pt-4 pb-2">
            <SubtleButton
              onClick={() => {
                setShowForm(false);
                resetarFormulario();
              }}
            >
              Cancelar
            </SubtleButton>
            <Button
              disabled={saving}
              onClick={async () => {
                if (!validarFormulario()) {
                  return;
                }
                setSaving(true);
                try {
                  // Limpar payload removendo campos undefined desnecessários
                  const payload: PlanoEntradaPayload = {
                    weekDay: form.weekDay,
                    exerciseName: form.exerciseName,
                    muscleGroup: form.muscleGroup,
                    tipoTreino: form.tipoTreino,
                    executionMode: form.executionMode,
                  };

                  // Adicionar campos específicos por tipo (apenas valores válidos)
                  if (form.tipoTreino === 'FORCA' || form.tipoTreino === 'PESO_CORPO') {
                    if (form.targetSets && form.targetSets > 0) payload.targetSets = form.targetSets;
                    if (form.targetReps && form.targetReps > 0) payload.targetReps = form.targetReps;
                    if (form.restSeconds !== undefined && form.restSeconds !== null && form.restSeconds >= 0)
                      payload.restSeconds = form.restSeconds;
                  } else if (form.tipoTreino === 'TEMPO') {
                    if (form.targetSets && form.targetSets > 0) payload.targetSets = form.targetSets;
                    if (form.targetDuration && form.targetDuration > 0) payload.targetDuration = form.targetDuration;
                    if (form.restSeconds !== undefined && form.restSeconds !== null && form.restSeconds >= 0)
                      payload.restSeconds = form.restSeconds;
                  } else if (form.tipoTreino === 'CARDIO') {
                    if (form.weeklyTargetMinutes && form.weeklyTargetMinutes > 0)
                      payload.weeklyTargetMinutes = form.weeklyTargetMinutes;
                  }

                  await adicionarExercicioAoPlano(payload);
                  const refreshed = await obterPlanoSemanal();
                  setPlano(refreshed);
                  setShowForm(false);
                  resetarFormulario();
                } catch (error) {
                  console.error('Erro ao salvar:', error);
                  const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar exercício. Verifique os campos e tente novamente.';
                  alert(errorMessage);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Salvando...' : 'Salvar no plano'}
            </Button>
          </div>
        </div>
      </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
