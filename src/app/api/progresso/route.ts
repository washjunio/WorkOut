import { NextResponse } from 'next/server';
import { ensureDemoUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from '@/lib/dominio/week';
import { calcularProgressoPorGrupo, calcularProgressoCardio } from '@/lib/dominio/progresso';

export async function GET() {
  const user = await ensureDemoUser();
  const start = startOfWeek();
  const end = endOfWeek();

  const planExercises = await prisma.planExercise.findMany({
    where: { workoutPlan: { userId: user.id } },
    include: { exercise: true },
  });

  const execucoesDb = await prisma.exerciseExecution.findMany({
    where: { userId: user.id, executedAt: { gte: start, lte: end } },
  });
  const execucoes = execucoesDb.map((e) => ({
    ...e,
    executedAt: e.executedAt.toISOString(),
  }));

  const cardioDb = await prisma.cardioSession.findMany({
    where: { userId: user.id, startedAt: { gte: start, lte: end } },
  });
  const cardio = cardioDb.map((c) => ({
    ...c,
    startedAt: c.startedAt.toISOString(),
  }));

  const planoSimplificado = planExercises.map((p) => ({
    id: p.exerciseId,
    name: p.exercise.name,
    muscleGroup: p.exercise.muscleGroup,
    type: p.exercise.type,
    targetSets: p.targetSets,
    targetReps: p.targetReps ?? undefined,
    targetWeight: p.targetWeight ?? undefined,
    targetDuration: p.targetDuration ?? undefined,
  }));

  const progressoMuscular = calcularProgressoPorGrupo(planoSimplificado, execucoes);
  const progressoCardio = calcularProgressoCardio(cardio);

  return NextResponse.json(
    { data: { grupos: progressoMuscular, cardio: progressoCardio } },
    { headers: { 'Cache-Control': 'private, max-age=30' } },
  );
}
