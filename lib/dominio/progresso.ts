import type { CardioSessionDTO, ExerciseDTO, ExerciseExecutionDTO } from '@/types';

type GrupoMuscularProgresso = {
  muscleGroup: string;
  alvoSeries: number;
  seriesExecutadas: number;
  percentual: number;
};

export function calcularProgressoPorGrupo(
  plano: ExerciseDTO[],
  execucoes: ExerciseExecutionDTO[],
): GrupoMuscularProgresso[] {
  const grupos = new Map<string, { alvo: number; feitos: number }>();

  plano.forEach((ex) => {
    const alvo = ex.targetSets ?? 0;
    const entry = grupos.get(ex.muscleGroup) || { alvo: 0, feitos: 0 };
    entry.alvo += alvo;
    grupos.set(ex.muscleGroup, entry);
  });

  execucoes.forEach((ex) => {
    const exercise = plano.find((p) => p.id === ex.exerciseId);
    if (!exercise) return;
    const entry = grupos.get(exercise.muscleGroup) || { alvo: 0, feitos: 0 };
    // Considera 1 serie executada por registro
    entry.feitos += 1;
    grupos.set(exercise.muscleGroup, entry);
  });

  return Array.from(grupos.entries()).map(([muscleGroup, { alvo, feitos }]) => ({
    muscleGroup,
    alvoSeries: alvo,
    seriesExecutadas: feitos,
    percentual: alvo === 0 ? 0 : Math.min(100, Math.round((feitos / alvo) * 100)),
  }));
}

export function calcularProgressoCardio(
  sessions: CardioSessionDTO[],
  metaMinutos = 90,
): { total: number; meta: number; percentual: number } {
  const total = sessions.reduce((acc, s) => acc + s.duration, 0);
  const percentual = Math.min(100, Math.round((total / metaMinutos) * 100));
  return { total, meta: metaMinutos, percentual };
}

export function normalizarExecucao(ex: ExerciseExecutionDTO) {
  if (ex.type === 'FORCA_CARGA') {
    return `${ex.reps ?? 0} reps @ ${ex.weight ?? 0}kg`;
  }
  if (ex.type === 'PESO_CORPORAL') {
    return `${ex.reps ?? 0} reps`;
  }
  return `${ex.durationSec ?? 0}s`;
}
