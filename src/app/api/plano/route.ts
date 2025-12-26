import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureDemoUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const tipoTreinoSchema = z.enum(['FORCA', 'PESO_CORPO', 'TEMPO', 'CARDIO']);

const addSchema = z
  .object({
    weekDay: z.number().int().min(0).max(6),
    name: z.string().min(1).optional(),
    exerciseId: z.string().optional(),
    exerciseName: z.string().min(2),
    muscleGroup: z.string().min(2),
    tipoTreino: tipoTreinoSchema,
    executionMode: z.enum(['REPETICOES', 'TEMPO', 'CARDIO']),
    targetSets: z.number().int().positive().optional(),
    targetReps: z.number().int().positive().optional(),
    targetDuration: z.number().int().positive().optional(),
    restSeconds: z.number().int().positive().optional(),
    weeklyTargetMinutes: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    // Validação por tipo de treino
    if (data.tipoTreino === 'FORCA' || data.tipoTreino === 'PESO_CORPO') {
      if (!data.targetSets || data.targetSets < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Número de séries é obrigatório para FORCA e PESO_CORPO',
          path: ['targetSets'],
        });
      }
      if (!data.targetReps || data.targetReps < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Repetições por série é obrigatório para FORCA e PESO_CORPO',
          path: ['targetReps'],
        });
      }
      if (data.restSeconds === undefined || data.restSeconds === null || data.restSeconds < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Descanso entre séries é obrigatório para FORCA e PESO_CORPO',
          path: ['restSeconds'],
        });
      }
    } else if (data.tipoTreino === 'TEMPO') {
      if (!data.targetSets || data.targetSets < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Número de séries é obrigatório para TEMPO',
          path: ['targetSets'],
        });
      }
      if (!data.targetDuration || data.targetDuration < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Tempo por série é obrigatório para TEMPO',
          path: ['targetDuration'],
        });
      }
      if (data.restSeconds === undefined || data.restSeconds === null || data.restSeconds < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Descanso entre séries é obrigatório para TEMPO',
          path: ['restSeconds'],
        });
      }
    } else if (data.tipoTreino === 'CARDIO') {
      if (!data.weeklyTargetMinutes || data.weeklyTargetMinutes < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Meta semanal de minutos é obrigatória para CARDIO',
          path: ['weeklyTargetMinutes'],
        });
      }
    }
  });

export async function GET() {
  const user = await ensureDemoUser();
  const plans = await prisma.workoutPlan.findMany({
    where: { userId: user.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { weekDay: 'asc' },
  });
  return NextResponse.json({ data: plans });
}

export async function POST(request: Request) {
  try {
    const user = await ensureDemoUser();
    const body = await request.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            message: 'Erro de validação',
            fieldErrors: parsed.error.flatten().fieldErrors,
            formErrors: parsed.error.flatten().formErrors,
          },
        },
        { status: 400 },
      );
    }
  const {
    weekDay,
    name,
    exerciseId,
    exerciseName,
    muscleGroup,
    tipoTreino,
    executionMode,
    targetSets,
    targetReps,
    targetDuration,
    restSeconds,
    weeklyTargetMinutes,
  } = parsed.data;

  // Buscar ou criar plano para o dia da semana
  let plan = await prisma.workoutPlan.findFirst({
    where: { userId: user.id, weekDay },
  });
  if (!plan) {
    plan = await prisma.workoutPlan.create({
      data: { userId: user.id, weekDay, name: name || 'Plano semanal' },
    });
  } else if (name) {
    plan = await prisma.workoutPlan.update({
      where: { id: plan.id },
      data: { name },
    });
  }

  let exerciseIdToUse = exerciseId || '';
  if (!exerciseIdToUse) {
    const existing = await prisma.exercise.findFirst({
      where: { userId: user.id, name: exerciseName },
    });
    if (existing) {
      exerciseIdToUse = existing.id;
    } else {
      // Mapear TipoTreino para ExecutionType
      const type =
        tipoTreino === 'CARDIO'
          ? 'CARDIO_CONTINUO'
          : tipoTreino === 'TEMPO'
          ? 'TEMPO'
          : tipoTreino === 'PESO_CORPO'
          ? 'PESO_CORPORAL'
          : 'FORCA_CARGA';
      const created = await prisma.exercise.create({
        data: {
          name: exerciseName,
          muscleGroup,
          type,
          userId: user.id,
        },
      });
      exerciseIdToUse = created.id;
    }
  }

  const position = await prisma.planExercise.count({ where: { workoutPlanId: plan.id } });
  const entry = await prisma.planExercise.create({
      data: {
        workoutPlanId: plan.id,
        exerciseId: exerciseIdToUse,
        tipoTreino,
        executionMode,
        targetSets: tipoTreino === 'CARDIO' ? null : targetSets ?? undefined,
        targetReps: tipoTreino === 'FORCA' || tipoTreino === 'PESO_CORPO' ? targetReps : null,
        targetDuration: tipoTreino === 'TEMPO' ? targetDuration : null,
        restSeconds: tipoTreino === 'CARDIO' ? null : restSeconds ?? undefined,
        weeklyTargetMinutes: tipoTreino === 'CARDIO' ? weeklyTargetMinutes : null,
        position,
      },
    });
  return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar exercício no plano:', error);
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Erro interno do servidor',
        },
      },
      { status: 500 },
    );
  }
}
