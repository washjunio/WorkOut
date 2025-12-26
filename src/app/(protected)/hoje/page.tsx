"use client";

import { useEffect, useMemo, useState } from 'react';
import { listarExercicios } from '@/services/exercicios.service';
import { registrarExecucao, listarExecucoes } from '@/services/execucoes.service';
import { obterRegistroDiario, salvarRegistroDiario } from '@/services/registroDiario.service';
import { obterPlanoSemanal } from '@/services/plano.service';
import type {
  ExerciseDTO,
  ExerciseExecutionDTO,
  ExecutionType,
  FoodIntakeLevel,
} from '@/types';
import { useCronometro } from '@/hooks/useCronometro';
import { normalizarExecucao } from '@/lib/dominio/progresso';
import { Button, Card, Skeleton, SubtleButton, Toast } from '@/components/ui';

type ExerciseInput = { reps?: number; weight?: number; durationSec?: number; minutes?: number };
type PlannedExercise = {
  planExerciseId?: string;
  executionMode: 'REPETICOES' | 'TEMPO' | 'CARDIO';
  restSeconds?: number | null;
  targetSets?: number | null;
  targetReps?: number | null;
  targetDuration?: number | null;
  targetWeight?: number | null;
  weeklyTargetMinutes?: number | null;
  exercise: ExerciseDTO;
};

// Dashboard diario exibindo execucoes do dia, habitos e cardio rapido.
export default function HojePage() {
  const [planExercises, setPlanExercises] = useState<PlannedExercise[]>([]);
  const [inputs, setInputs] = useState<Record<string, ExerciseInput>>({});
  const [histories, setHistories] = useState<Record<string, ExerciseExecutionDTO[]>>({});
  const [water, setWater] = useState<number>(0);
  const [food, setFood] = useState<FoodIntakeLevel>('DENTRO_DA_DIETA');
  const [note, setNote] = useState('');
  const restTimer = useCronometro(90);
  const tempoTimer = useCronometro(0);
  const [tempoTarget, setTempoTarget] = useState(0);
  const [cardioSeconds, setCardioSeconds] = useState(0);
  const [cardioRunning, setCardioRunning] = useState(false);
  const [activeExercise, setActiveExercise] = useState<PlannedExercise | null>(null);
  const [showRest, setShowRest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const today = new Date().getDay();
    obterPlanoSemanal()
      .then((plano) => {
        const dia = plano.filter((p) => p.weekDay === today);
        if (dia.length) {
          const mapped = dia.flatMap((d) =>
            d.exercises.map((ex) => ({
              planExerciseId: ex.id,
              executionMode: ex.executionMode as PlannedExercise['executionMode'],
              restSeconds: ex.restSeconds ?? undefined,
              targetSets: ex.targetSets,
              targetReps: ex.targetReps ?? undefined,
              targetWeight: ex.targetWeight ?? undefined,
              targetDuration: ex.targetDuration ?? undefined,
              weeklyTargetMinutes: ex.weeklyTargetMinutes ?? undefined,
              exercise: {
                id: ex.exercise.id,
                name: ex.exercise.name,
                muscleGroup: ex.exercise.muscleGroup,
                type: ex.exercise.type as ExecutionType,
              },
            })),
          );
          setPlanExercises(mapped);
        } else {
          listarExercicios().then((list) => {
            const fallback = list.map((ex) => ({
              executionMode:
                ex.type === 'TEMPO'
                  ? 'TEMPO'
                  : ex.type === 'CARDIO_CONTINUO'
                  ? 'CARDIO'
                  : 'REPETICOES',
              exercise: ex,
              targetSets: ex.targetSets ?? 3,
              targetReps: ex.targetReps ?? 10,
              targetDuration: ex.targetDuration ?? 60,
              restSeconds: 90,
            }));
            setPlanExercises(fallback);
          });
        }
      })
      .finally(() => setLoading(false));
    obterRegistroDiario().then((log) => {
      if (!log) return;
      setWater(log.waterLiters);
      setFood(log.foodIntake);
      setNote(log.note || '');
    });
  }, []);

  const grouped = useMemo(() => {
    return planExercises.reduce<Record<string, PlannedExercise[]>>((acc, ex) => {
      acc[ex.exercise.muscleGroup] = acc[ex.exercise.muscleGroup] || [];
      acc[ex.exercise.muscleGroup].push(ex);
      return acc;
    }, {});
  }, [planExercises]);

  const handleInputChange = (id: string, field: keyof ExerciseInput, value: number) => {
    setInputs((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const registrar = async (
    exercise: PlannedExercise,
    overrides: Partial<ExerciseInput & { durationSec?: number }> = {},
  ) => {
    const exerciseId = exercise.exercise.id;
    const input = inputs[exerciseId] || {};
    const payload: any = {
      exerciseId,
      planExerciseId: exercise.planExerciseId,
      type:
        exercise.executionMode === 'CARDIO'
          ? ('CARDIO_CONTINUO' as ExecutionType)
          : exercise.executionMode === 'TEMPO'
          ? ('TEMPO' as ExecutionType)
          : ('FORCA_CARGA' as ExecutionType),
    };

    if (exercise.executionMode === 'REPETICOES') {
      payload.reps = overrides.reps ?? input.reps ?? exercise.targetReps ?? 10;
      payload.weight = overrides.weight ?? input.weight ?? exercise.targetWeight ?? 10;
    } else if (exercise.executionMode === 'TEMPO') {
      payload.durationSec = overrides.durationSec ?? input.durationSec ?? exercise.targetDuration ?? 60;
    } else if (exercise.executionMode === 'CARDIO') {
      if (overrides.durationSec !== undefined) {
        payload.durationSec = overrides.durationSec;
      } else {
        const minutes = overrides.minutes ?? input.minutes ?? exercise.weeklyTargetMinutes ?? 10;
        payload.durationSec = minutes * 60;
      }
    }
    await registrarExecucao(payload);
    const novas = await listarExecucoes(exerciseId, 10);
    setHistories((prev) => ({ ...prev, [exerciseId]: novas }));
    setToast({ message: 'Execução registrada!', type: 'success' });
    setTimeout(() => setToast(null), 2000);
    if (exercise.executionMode === 'REPETICOES') {
      restTimer.start(exercise.restSeconds ?? 90);
      setShowRest(true);
    }
  };

  const salvarHabitos = async () => {
    try {
      await salvarRegistroDiario({ waterLiters: water, foodIntake: food, note });
      setToast({ message: 'Hábitos salvos com sucesso!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ message: 'Erro ao salvar hábitos', type: 'error' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const activeHistory = activeExercise ? histories[activeExercise.exercise.id] || [] : [];
  const currentSet =
    activeExercise?.targetSets && activeHistory.length < activeExercise.targetSets
      ? activeHistory.length + 1
      : activeHistory.length + 1;
  const lastExecution = activeHistory[0];

  const closeOverlay = () => {
    setActiveExercise(null);
    setShowRest(false);
    setCardioRunning(false);
    setCardioSeconds(0);
  };

  const formatSeconds = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (!cardioRunning) return;
    const id = setInterval(() => setCardioSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [cardioRunning]);

  useEffect(() => {
    if (!activeExercise) return;
    if (activeExercise.executionMode === 'TEMPO') {
      const target = activeExercise.targetDuration ?? 60;
      setTempoTarget(target);
      tempoTimer.reset(target);
    }
    if (activeExercise.executionMode === 'CARDIO') {
      setCardioSeconds(0);
      setCardioRunning(false);
    }
  }, [activeExercise]);

  return (
    <>
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Hoje</h1>
          <p className="text-sm text-[--muted]">Execução rápida do plano semanal</p>
        </div>
     
      </header>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold">Hábitos diários</h2>
            <p className="text-xs text-[--muted]">Água e alimentação</p>
          </div>
          <Button className="shrink-0" onClick={salvarHabitos}>
            Salvar
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            Água (L)
            <input
              type="number"
              value={water}
              onChange={(e) => setWater(parseFloat(e.target.value))}
              className="w-24 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[--text]"
              step="0.1"
              min="0"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {(['DENTRO_DA_DIETA', 'LEVEMENTE_ACIMA', 'ACIMA', 'FORA_DA_DIETA'] as FoodIntakeLevel[]).map(
              (level) => (
                <button
                  key={level}
                  onClick={() => setFood(level)}
                  className={`rounded-full px-3 py-2 text-xs transition ${
                    food === level
                      ? 'border border-[var(--accent)] bg-[var(--surface)] text-[var(--accent)]'
                      : 'border border-[var(--border)] bg-[var(--bg)] text-[--text] hover:border-[var(--accent)]'
                  }`}
                >
                  {level.replaceAll('_', ' ').toLowerCase()}
                </button>
              ),
            )}
          </div>
        </div>
        <textarea
          placeholder="Observações"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-sm text-[--text] outline-none focus:border-[var(--accent)]"
        />
      </Card>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((k) => (
            <Card key={k} className="space-y-3 fade-in" style={{ animationDelay: `${k * 0.1}s` }}>
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-5/6" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading &&
        Object.entries(grouped).map(([muscle, items], index) => (
          <Card key={muscle} className="space-y-4 slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <h3 className="text-lg font-semibold">{muscle}</h3>
            <div className="space-y-3">
              {items.map((ex) => (
                <div
                  key={ex.planExerciseId ?? ex.exercise.id}
                  className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 transition hover:border-[var(--accent)]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={async () => {
                        const h = await listarExecucoes(ex.exercise.id, 10);
                        setHistories((prev) => ({ ...prev, [ex.exercise.id]: h }));
                      }}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="font-semibold text-base">{ex.exercise.name}</div>
                      <div className="text-xs text-[--muted] mt-0.5">{ex.exercise.muscleGroup}</div>
                    </div>
                    <Button
                      onClick={() => {
                        setActiveExercise(ex);
                        if (!histories[ex.exercise.id]) {
                          listarExecucoes(ex.exercise.id, 10).then((h) =>
                            setHistories((prev) => ({ ...prev, [ex.exercise.id]: h })),
                          );
                        }
                      }}
                      className="shrink-0"
                    >
                      Executar
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    {ex.executionMode === 'REPETICOES' && (
                      <>
                        <input
                          type="number"
                          className="w-20 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                          placeholder="Reps"
                          value={inputs[ex.exercise.id]?.reps ?? ''}
                          onChange={(e) =>
                            handleInputChange(ex.exercise.id, 'reps', Number(e.target.value))
                          }
                        />
                        <input
                          type="number"
                          className="w-24 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                          placeholder="Peso (kg)"
                          value={inputs[ex.exercise.id]?.weight ?? ''}
                          onChange={(e) =>
                            handleInputChange(ex.exercise.id, 'weight', Number(e.target.value))
                          }
                        />
                      </>
                    )}
                    {ex.executionMode === 'TEMPO' && (
                      <input
                        type="number"
                        className="w-24 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                        placeholder="Segundos"
                        value={inputs[ex.exercise.id]?.durationSec ?? ex.targetDuration ?? ''}
                        onChange={(e) =>
                          handleInputChange(ex.exercise.id, 'durationSec', Number(e.target.value))
                        }
                      />
                    )}
                    {ex.executionMode === 'CARDIO' && (
                      <input
                        type="number"
                        className="w-24 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                        placeholder="Minutos"
                        value={inputs[ex.exercise.id]?.minutes ?? ''}
                        onChange={(e) =>
                          handleInputChange(ex.exercise.id, 'minutes', Number(e.target.value))
                        }
                      />
                    )}
                  </div>

                  <div className="text-xs text-[--muted]">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-semibold text-[--text]">Histórico</span>
                      <SubtleButton
                        className="px-2 py-1 text-[--accent]"
                        onClick={async () => {
                          const h = await listarExecucoes(ex.exercise.id, 10);
                          setHistories((prev) => ({ ...prev, [ex.exercise.id]: h }));
                        }}
                      >
                        Ver últimas
                      </SubtleButton>
                    </div>
                    <div className="space-y-1">
                      {(histories[ex.exercise.id] || []).slice(0, 5).map((h) => (
                        <div
                          key={h.id}
                          className="flex justify-between rounded-lg bg-[var(--bg)] px-2 py-1"
                        >
                          <span>
                            {new Date(h.executedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>{normalizarExecucao(h)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
    </section>

    {/* Overlay de execução */}
    {activeExercise && !showRest && (
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm fade-in">
        <div className="absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl bg-[var(--surface)] p-5 pb-24 shadow-2xl slide-up overflow-y-auto">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">{activeExercise.exercise.name}</div>
              <div className="text-sm text-[--muted]">
                Set {currentSet} / {activeExercise.targetSets ?? '--'}
              </div>
            </div>
            <button onClick={closeOverlay} className="text-[--muted]">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <Card className="bg-[var(--surface-strong)]">
              <div className="text-xs text-[--muted]">Última vez</div>
              <div className="mt-1 text-lg font-semibold">
                {lastExecution ? normalizarExecucao(lastExecution) : 'Sem histórico'}
              </div>
            </Card>

            {activeExercise.executionMode === 'REPETICOES' && (
              <div className="space-y-3">
                <label className="text-sm text-[--muted]">
                  Repetições
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-lg"
                    value={inputs[activeExercise.exercise.id]?.reps ?? activeExercise.targetReps ?? ''}
                    onChange={(e) =>
                      handleInputChange(activeExercise.exercise.id, 'reps', Number(e.target.value))
                    }
                  />
                </label>
                <label className="text-sm text-[--muted]">
                  Peso (kg)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-lg"
                    value={inputs[activeExercise.exercise.id]?.weight ?? activeExercise.targetWeight ?? ''}
                    onChange={(e) =>
                      handleInputChange(activeExercise.exercise.id, 'weight', Number(e.target.value))
                    }
                  />
                </label>
              </div>
            )}

            {activeExercise.executionMode === 'TEMPO' && (
              <label className="text-sm text-[--muted]">
                Duração (segundos)
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-lg"
                  value={inputs[activeExercise.exercise.id]?.durationSec ?? activeExercise.targetDuration ?? ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTempoTarget(val);
                    handleInputChange(activeExercise.exercise.id, 'durationSec', val);
                  }}
                />
              </label>
            )}

            {activeExercise.executionMode === 'CARDIO' && (
              <label className="text-sm text-[--muted]">
                Duração (minutos)
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-lg"
                  value={inputs[activeExercise.exercise.id]?.minutes ?? ''}
                  onChange={(e) =>
                    handleInputChange(activeExercise.exercise.id, 'minutes', Number(e.target.value))
                  }
                />
              </label>
            )}

            {activeExercise.executionMode === 'REPETICOES' && (
              <div className="sticky bottom-0 bg-[var(--surface)] pt-4 pb-2 -mx-5 px-5">
                <Button
                  className="w-full py-3 text-base"
                  onClick={() => {
                    registrar(activeExercise);
                    setShowRest(true);
                  }}
                >
                  Confirmar série
                </Button>
              </div>
            )}

            {activeExercise.executionMode === 'TEMPO' && (
              <div className="space-y-3 text-center">
                <div className="text-4xl font-bold">{formatSeconds(tempoTimer.remaining || tempoTarget)}</div>
                <div className="flex justify-center gap-2">
                  <Button
                    className="px-4 py-2"
                    onClick={() => tempoTimer.start(tempoTarget || activeExercise.targetDuration || 60)}
                  >
                    Iniciar
                  </Button>
                  <SubtleButton className="px-4 py-2" onClick={() => tempoTimer.pause()}>
                    Pausar
                  </SubtleButton>
                </div>
                <div className="sticky bottom-0 bg-[var(--surface)] pt-4 pb-2 -mx-5 px-5">
                  <Button
                    className="w-full py-3 text-base"
                    onClick={() => {
                      const target = tempoTarget || activeExercise.targetDuration || 60;
                      const done = Math.max(0, target - tempoTimer.remaining);
                      registrar(activeExercise, { durationSec: done || target });
                      closeOverlay();
                    }}
                  >
                    Finalizar
                  </Button>
                </div>
              </div>
            )}

            {activeExercise.executionMode === 'CARDIO' && (
              <div className="space-y-3 text-center">
                <div className="text-4xl font-bold">{formatSeconds(cardioSeconds)}</div>
                <div className="flex justify-center gap-2">
                  <Button className="px-4 py-2" onClick={() => setCardioRunning(true)}>
                    {cardioRunning ? 'Rodando' : 'Iniciar'}
                  </Button>
                  <SubtleButton className="px-4 py-2" onClick={() => setCardioRunning(false)}>
                    Pausar
                  </SubtleButton>
                </div>
                <div className="sticky bottom-0 bg-[var(--surface)] pt-4 pb-2 -mx-5 px-5">
                  <Button
                    className="w-full py-3 text-base"
                    onClick={() => {
                      registrar(activeExercise, { durationSec: cardioSeconds });
                      setCardioRunning(false);
                      closeOverlay();
                    }}
                  >
                    Finalizar cardio
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Overlay descanso */}
    {activeExercise && showRest && (
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm fade-in">
        <div className="absolute inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl bg-[var(--surface)] p-6 pb-24 text-center shadow-2xl slide-up overflow-y-auto">
          <div className="flex justify-end">
            <button onClick={closeOverlay} className="text-[--muted]">
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-[--muted]">Tempo de descanso</div>
            <div className="text-xl font-semibold">{activeExercise.exercise.name}</div>
            <div className="text-5xl font-bold tracking-tight">
              {String(Math.floor(restTimer.remaining / 60)).padStart(2, '0')}:
              {String(restTimer.remaining % 60).padStart(2, '0')}
            </div>
            <div className="mx-auto h-2 w-full rounded-full bg-[var(--bg)]">
              <div
                className="h-2 rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${(restTimer.remaining / 90) * 100}%` }}
              />
            </div>
            <SubtleButton className="w-full py-3 text-[--accent]" onClick={() => restTimer.skip()}>
              Pular descanso
            </SubtleButton>
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
    </>
  );
}
