import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ensureDemoUser } from '@/lib/auth';
import { startOfWeek, endOfWeek } from '@/lib/dominio/week';

const cardioSchema = z.object({
  modality: z.string().min(2),
  duration: z.number().int().positive(), // minutos
  distanceKm: z.number().positive().optional(),
  notes: z.string().optional(),
});

// Handler de cardio; ideal para registrar corridas, pedaladas ou afins.
export async function GET() {
  const user = await ensureDemoUser();
  const start = startOfWeek();
  const end = endOfWeek();
  const sessions = await prisma.cardioSession.findMany({
    where: { userId: user.id, startedAt: { gte: start, lte: end } },
  });
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  return NextResponse.json(
    { data: { totalMinutes, sessions } },
    { headers: { 'Cache-Control': 'private, max-age=30' } },
  );
}

export async function POST(request: Request) {
  const user = await ensureDemoUser();
  const body = await request.json();
  const parsed = cardioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const session = await prisma.cardioSession.create({
    data: {
      modality: data.modality,
      duration: data.duration,
      distanceKm: data.distanceKm,
      notes: data.notes,
      user: { connect: { id: user.id } },
    },
  });
  return NextResponse.json({ data: session }, { status: 201 });
}
