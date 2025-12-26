"use client";

import { useEffect, useState } from 'react';
import { listarExercicios } from '@/services/exercicios.service';
import { adicionarExercicioAoPlano, obterPlanoSemanal } from '@/services/plano.service';
import { Card, Button } from '@/components/ui';

type PlanoDia = Awaited<ReturnType<typeof obterPlanoSemanal>>[number];

// Tela de configuracoes: cadastro de plano semanal simples.
export default function ConfiguracoesPage() {
  const [plano, setPlano] = useState<PlanoDia[]>([]);
  const [exercicios, setExercicios] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    weekDay: 1,
    exerciseId: '',
    targetSets: 3,
    targetReps: 10,
    targetWeight: 20,
  });

  useEffect(() => {
    obterPlanoSemanal().then(setPlano);
    listarExercicios().then((list) => setExercicios(list.map((e) => ({ id: e.id, name: e.name }))));
  }, []);

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const handleSubmit = async () => {
    if (!form.exerciseId) return;
    await adicionarExercicioAoPlano({
      weekDay: form.weekDay,
      exerciseId: form.exerciseId,
      targetSets: form.targetSets,
      targetReps: form.targetReps,
      targetWeight: form.targetWeight,
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
          <label className="text-sm">
            Peso alvo (kg)
            <input
              type="number"
              className="mt-1 w-full rounded bg-[var(--bg)] px-2 py-2 text-sm"
              value={form.targetWeight}
              onChange={(e) => setForm((f) => ({ ...f, targetWeight: Number(e.target.value) }))}
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
