import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ensureDemoUser } from '@/lib/auth';

const dailySchema = z.object({
  waterLiters: z.number().nonnegative(),
  foodIntake: z.enum(['DENTRO_DA_DIETA', 'LEVEMENTE_ACIMA', 'ACIMA', 'FORA_DA_DIETA']),
  note: z.string().optional(),
});

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  end.setMilliseconds(-1);
  return { start, end };
}

// Handler de registros diarios (habitos, humor, sono).
export async function GET() {
  const user = await ensureDemoUser();
  const { start, end } = todayRange();
  const log = await prisma.dailyLog.findFirst({
    where: { userId: user.id, date: { gte: start, lte: end } },
  });
  return NextResponse.json({ data: log || null }, { headers: { 'Cache-Control': 'private, max-age=30' } });
}

export async function POST(request: Request) {
  return upsertLog(request);
}

export async function PUT(request: Request) {
  return upsertLog(request);
}

async function upsertLog(request: Request) {
  const user = await ensureDemoUser();
  const body = await request.json();
  const parsed = dailySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { start } = todayRange();
  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date: start } },
    update: parsed.data,
    create: {
      waterLiters: parsed.data.waterLiters,
      foodIntake: parsed.data.foodIntake,
      note: parsed.data.note,
      date: start,
      user: { connect: { id: user.id } },
    },
  });
  return NextResponse.json({ data: log });
}
