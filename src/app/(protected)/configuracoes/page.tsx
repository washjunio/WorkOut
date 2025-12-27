"use client";

import { useEffect, useState } from 'react';
import { listarExercicios } from '@/services/exercicios.service';
import { adicionarExercicioAoPlano, obterPlanoSemanal } from '@/services/plano.service';
import type { ExerciseDTO } from '@/types';
import { Card, Button } from '@/components/ui';

type PlanoDia = Awaited<ReturnType<typeof obterPlanoSemanal>>[number];

// Tela de configuracoes: cadastro de plano semanal simples.
export default function ConfiguracoesPage() {
  const [plano, setPlano] = useState<PlanoDia[]>([]);
  const [exercicios, setExercicios] = useState<ExerciseDTO[]>([]);
  const [form, setForm] = useState({
    weekDay: 1,
    exerciseId: '',
    targetSets: 3,
    targetReps: 10,
    exerciseName: '',
    muscleGroup: 'Peito',
    executionMode: 'REPETICOES' as 'REPETICOES' | 'TEMPO' | 'CARDIO',
    tipoTreino: 'FORCA' as 'FORCA' | 'PESO_CORPO' | 'TEMPO' | 'CARDIO',
  });

  useEffect(() => {
    obterPlanoSemanal().then(setPlano);
    listarExercicios().then((list) => setExercicios(list));
  }, []);

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const handleSubmit = async () => {
    if (!form.exerciseId) return;
    const selected = exercicios.find((e) => e.id === form.exerciseId);
    const tipo =
      form.tipoTreino ||
      (form.executionMode === 'CARDIO'
        ? 'CARDIO'
        : form.executionMode === 'TEMPO'
        ? 'TEMPO'
        : 'FORCA');
    await adicionarExercicioAoPlano({
      weekDay: form.weekDay,
      exerciseId: form.exerciseId,
      exerciseName: selected?.name || form.exerciseName || 'Exercício',
      muscleGroup: selected?.muscleGroup || form.muscleGroup,
      tipoTreino: tipo,
      executionMode: form.executionMode,
      targetSets: form.targetSets,
      targetReps: form.targetReps,
      targetDuration: form.executionMode === 'TEMPO' ? 60 : undefined,
      weeklyTargetMinutes: form.executionMode === 'CARDIO' ? 90 : undefined,
    });
    const atualizado = await obterPlanoSemanal();
    setPlano(atualizado);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-[--muted]">Gerencie seus exercícios e preferências</p>
      </header>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Adicionar exercício ao plano</h2>
          <p className="text-xs text-[--muted]">Cadastre exercícios no plano semanal</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Dia da semana
            <select
              className="mt-1 w-full rounded bg-[var(--bg)] px-2 py-2 text-sm"
              value={form.weekDay}
              onChange={(e) => setForm((f) => ({ ...f, weekDay: Number(e.target.value) }))}
            >
              {diasSemana.map((d, idx) => (
                <option key={d} value={idx}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Exercício
            <select
              className="mt-1 w-full rounded bg-[var(--bg)] px-2 py-2 text-sm"
              value={form.exerciseId}
              onChange={(e) => setForm((f) => ({ ...f, exerciseId: e.target.value }))}
            >
              <option value="">Selecione</option>
              {exercicios.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Séries alvo
            <input
              type="number"
              className="mt-1 w-full rounded bg-[var(--bg)] px-2 py-2 text-sm"
              value={form.targetSets}
              onChange={(e) => setForm((f) => ({ ...f, targetSets: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm">
            Repetições alvo
            <input
              type="number"
              className="mt-1 w-full rounded bg-[var(--bg)] px-2 py-2 text-sm"
              value={form.targetReps}
              onChange={(e) => setForm((f) => ({ ...f, targetReps: Number(e.target.value) }))}
            />
          </label>
        </div>
        <Button onClick={handleSubmit} className="w-full">
          Adicionar ao plano
        </Button>
      </Card>

      <div className="space-y-3">
        {plano.map((dia) => (
          <Card key={dia.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{diasSemana[dia.weekDay]}</div>
              <div className="text-xs text-[--muted]">{dia.exercises.length} exercícios</div>
            </div>
            <div className="space-y-1 text-sm text-[--muted]">
              {dia.exercises.map((ex) => (
                <div key={ex.id} className="flex justify-between">
                  <span>{ex.exercise.name}</span>
                  <span>
                    {ex.targetSets} x {ex.targetReps ?? '--'} @ {ex.targetWeight ?? '--'}kg
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
