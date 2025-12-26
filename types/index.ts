// Tipos transversais ou utilitarios (DTOs) que nao pertencem a um dominio especifico.
export type Pagination = {
  page: number;
  pageSize: number;
};

export type ApiResponse<T> = {
  data: T;
  error?: unknown;
};

export type ExecutionType = 'FORCA_CARGA' | 'PESO_CORPORAL' | 'TEMPO' | 'CARDIO_CONTINUO';
export type TipoTreino = 'FORCA' | 'PESO_CORPO' | 'TEMPO' | 'CARDIO';
export type FoodIntakeLevel = 'DENTRO_DA_DIETA' | 'LEVEMENTE_ACIMA' | 'ACIMA' | 'FORA_DA_DIETA';

export type ExerciseDTO = {
  id: string;
  name: string;
  muscleGroup: string;
  type: ExecutionType;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  targetDuration?: number;
};

export type ExerciseExecutionDTO = {
  id: string;
  exerciseId: string;
  userId: string;
  type: ExecutionType;
  reps?: number;
  weight?: number;
  durationSec?: number;
  executedAt: string;
  planExerciseId?: string;
  notes?: string;
};

export type CardioSessionDTO = {
  id: string;
  userId: string;
  modality: string;
  duration: number;
  distanceKm?: number;
  startedAt: string;
  notes?: string;
};

export type DailyLogDTO = {
  id: string;
  userId: string;
  date: string;
  waterLiters: number;
  foodIntake: FoodIntakeLevel;
  note?: string;
};
