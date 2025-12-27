import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ensureDemoUser } from '@/lib/auth';

const exerciseSchema = z.object({
  name: z.string().min(2),
  muscleGroup: z.string().min(2),
  type: z.enum(['FORCA_CARGA', 'PESO_CORPORAL', 'TEMPO', 'CARDIO_CONTINUO']),
});

// Handler de exercicios; delega logica para camada de services.
export async function GET() {
  const user = await ensureDemoUser();
  // Seed simples para facilitar uso inicial.
  const count = await prisma.exercise.count({ where: { userId: user.id } });
  if (count === 0) {
    await prisma.exercise.createMany({
      data: [
        { name: 'Supino reto', muscleGroup: 'Peito', type: 'FORCA_CARGA', userId: user.id },
        { name: 'Agachamento', muscleGroup: 'Pernas', type: 'FORCA_CARGA', userId: user.id },
        { name: 'Prancha', muscleGroup: 'Core', type: 'TEMPO', userId: user.id },
        { name: 'Corrida', muscleGroup: 'Cardio', type: 'CARDIO_CONTINUO', userId: user.id },
      ],
    });
    const created = await prisma.exercise.findMany({ where: { userId: user.id } });
    const plan = await prisma.workoutPlan.create({
      data: { userId: user.id, name: 'Semana base', weekDay: new Date().getDay() || 1 },
    });
    const mapByName = Object.fromEntries(created.map((e) => [e.name, e.id]));
    await prisma.planExercise.createMany({
      data: [
        {
          workoutPlanId: plan.id,
          exerciseId: mapByName['Supino reto'],
          tipoTreino: 'FORCA',
          executionMode: 'REPETICOES',
          targetSets: 4,
          targetReps: 10,
          targetWeight: 30,
          position: 1,
        },
        {
          workoutPlanId: plan.id,
          exerciseId: mapByName['Agachamento'],
          tipoTreino: 'FORCA',
          executionMode: 'REPETICOES',
          targetSets: 4,
          targetReps: 12,
          targetWeight: 40,
          position: 2,
        },
        {
          workoutPlanId: plan.id,
          exerciseId: mapByName['Prancha'],
          tipoTreino: 'TEMPO',
          executionMode: 'TEMPO',
          targetSets: 3,
          targetDuration: 60,
          position: 3,
        },
      ],
    });
  }
  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ userId: user.id }, { userId: null }] },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ data: exercises }, { headers: { 'Cache-Control': 'private, max-age=30' } });
}

export async function POST(request: Request) {
  const user = await ensureDemoUser();
  const body = await request.json();
  const parsed = exerciseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      name: parsed.data.name,
      muscleGroup: parsed.data.muscleGroup,
      type: parsed.data.type,
      user: { connect: { id: user.id } },
    },
  });

  return NextResponse.json({ data: exercise }, { status: 201 });
}
