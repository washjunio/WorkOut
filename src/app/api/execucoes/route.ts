import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ensureDemoUser } from '@/lib/auth';

const executionSchema = z.object({
  exerciseId: z.string().min(1),
  planExerciseId: z.string().optional(),
  type: z.enum(['FORCA_CARGA', 'PESO_CORPORAL', 'TEMPO', 'CARDIO_CONTINUO']),
  reps: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  durationSec: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

// Handler de execucoes de treino; mantem regras fora da camada HTTP.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get('exerciseId');
  const limit = Number(searchParams.get('limit') || 10);
  if (!exerciseId) {
    return NextResponse.json({ error: 'exerciseId obrigatorio' }, { status: 400 });
  }
  const user = await ensureDemoUser();
  const executions = await prisma.exerciseExecution.findMany({
    where: { exerciseId, userId: user.id },
    orderBy: { executedAt: 'desc' },
    take: Math.min(limit, 50),
  });
  return NextResponse.json({ data: executions }, { headers: { 'Cache-Control': 'private, max-age=30' } });
}

export async function POST(request: Request) {
  const user = await ensureDemoUser();
  const body = await request.json();
  const parsed = executionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const execution = await prisma.exerciseExecution.create({
    data: {
      ...data,
      userId: user.id,
    },
  });
  return NextResponse.json({ data: execution }, { status: 201 });
}
