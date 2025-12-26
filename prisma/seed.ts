import { PrismaClient, ExecutionType, FoodIntakeLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@workout.app' },
    update: {},
    create: { id: 'demo-user', email: 'demo@workout.app', name: 'Demo User' },
  });

  // Exercicios base
  const exercisesData = [
    { name: 'Supino reto', muscleGroup: 'Peito', type: ExecutionType.FORCA_CARGA },
    { name: 'Agachamento', muscleGroup: 'Pernas', type: ExecutionType.FORCA_CARGA },
    { name: 'Remada curvada', muscleGroup: 'Costas', type: ExecutionType.FORCA_CARGA },
    { name: 'Prancha', muscleGroup: 'Core', type: ExecutionType.TEMPO },
    { name: 'Flexão de braço', muscleGroup: 'Peito', type: ExecutionType.PESO_CORPORAL },
  { name: 'Corrida', muscleGroup: 'Cardio', type: ExecutionType.CARDIO_CONTINUO },
];

  // Limpeza respeitando FKs
  await prisma.exerciseExecution.deleteMany({ where: { userId: user.id } });
  await prisma.cardioSession.deleteMany({ where: { userId: user.id } });
  await prisma.dailyLog.deleteMany({ where: { userId: user.id } });
  await prisma.planExercise.deleteMany({ where: { workoutPlan: { userId: user.id } } });
  await prisma.workoutPlan.deleteMany({ where: { userId: user.id } });
  await prisma.exercise.deleteMany({ where: { userId: user.id } });
  const exercises = await Promise.all(
    exercisesData.map((ex) =>
      prisma.exercise.create({
        data: { ...ex, userId: user.id },
      }),
    ),
  );
  const mapEx = Object.fromEntries(exercises.map((e) => [e.name, e.id]));

  // Plano semanal simples (segunda, quarta, sexta)
  const weekPlans = [
    { weekDay: 1, name: 'Peito/Core', slots: ['Supino reto', 'Flexão de braço', 'Prancha'] },
    { weekDay: 3, name: 'Pernas/Costas', slots: ['Agachamento', 'Remada curvada', 'Prancha'] },
    { weekDay: 5, name: 'Cardio leve', slots: ['Corrida'] },
  ];

  await prisma.planExercise.deleteMany({ where: { workoutPlan: { userId: user.id } } });
  await prisma.workoutPlan.deleteMany({ where: { userId: user.id } });

  for (const plan of weekPlans) {
    const wp = await prisma.workoutPlan.create({
      data: { userId: user.id, weekDay: plan.weekDay, name: plan.name },
    });
    let pos = 0;
    for (const slot of plan.slots) {
      await prisma.planExercise.create({
        data: {
          workoutPlanId: wp.id,
          exerciseId: mapEx[slot],
          executionMode:
            slot === 'Prancha' ? 'TEMPO' : slot === 'Corrida' ? 'CARDIO' : 'REPETICOES',
          targetSets: 4,
          targetReps: slot === 'Prancha' ? null : 10,
          targetDuration: slot === 'Prancha' ? 60 : null,
          targetWeight: slot === 'Supino reto' ? 40 : slot === 'Agachamento' ? 50 : null,
          restSeconds: slot === 'Corrida' ? null : 90,
          weeklyTargetMinutes: slot === 'Corrida' ? 90 : null,
          position: pos++,
        },
      });
    }
  }

  // Execucoes recentes
  await prisma.exerciseExecution.deleteMany({ where: { userId: user.id } });
  const now = new Date();
  const execs = [
    {
      exerciseId: mapEx['Supino reto'],
      type: ExecutionType.FORCA_CARGA,
      reps: 10,
      weight: 40,
    },
    {
      exerciseId: mapEx['Agachamento'],
      type: ExecutionType.FORCA_CARGA,
      reps: 12,
      weight: 50,
    },
    {
      exerciseId: mapEx['Prancha'],
      type: ExecutionType.TEMPO,
      durationSec: 60,
    },
    {
      exerciseId: mapEx['Corrida'],
      type: ExecutionType.CARDIO_CONTINUO,
      durationSec: 20 * 60,
    },
  ];
  for (let i = 0; i < execs.length; i++) {
    await prisma.exerciseExecution.create({
      data: { ...execs[i], userId: user.id, executedAt: new Date(now.getTime() - i * 3600 * 1000) },
    });
  }

  // Cardio semanal
  await prisma.cardioSession.deleteMany({ where: { userId: user.id } });
  await prisma.cardioSession.createMany({
    data: [
      { userId: user.id, modality: 'Corrida', duration: 30, distanceKm: 5, startedAt: now },
      { userId: user.id, modality: 'Bike', duration: 40, distanceKm: 12, startedAt: now },
    ],
  });

  // Registro diário
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: { waterLiters: 2.2, foodIntake: FoodIntakeLevel.DENTRO_DA_DIETA, note: 'Dia ok' },
    create: {
      userId: user.id,
      date: today,
      waterLiters: 2.2,
      foodIntake: FoodIntakeLevel.DENTRO_DA_DIETA,
      note: 'Dia ok',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
