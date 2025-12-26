import { get } from './apiClient';
import type { ApiResponse } from '@/types';

type PlanoDia = {
  id: string;
  name: string;
  weekDay: number;
  exercises: Array<{
    id: string;
    tipoTreino: 'FORCA' | 'PESO_CORPO' | 'TEMPO' | 'CARDIO';
    executionMode: 'REPETICOES' | 'TEMPO' | 'CARDIO';
    targetSets?: number | null;
    targetReps?: number | null;
    targetWeight?: number | null;
    targetDuration?: number | null;
    restSeconds?: number | null;
    weeklyTargetMinutes?: number | null;
    exercise: {
      id: string;
      name: string;
      muscleGroup: string;
      type: string;
    };
  }>;
};

export async function obterPlanoSemanal() {
  const res = await get<ApiResponse<PlanoDia[]>>('/plano');
  return res.data;
}

export type PlanoEntradaPayload = {
  weekDay: number;
  name?: string;
  exerciseId?: string;
  exerciseName: string;
  muscleGroup: string;
  tipoTreino: 'FORCA' | 'PESO_CORPO' | 'TEMPO' | 'CARDIO';
  executionMode: 'REPETICOES' | 'TEMPO' | 'CARDIO';
  targetSets?: number;
  targetReps?: number;
  targetDuration?: number;
  restSeconds?: number;
  weeklyTargetMinutes?: number;
};

export async function adicionarExercicioAoPlano(payload: PlanoEntradaPayload) {
  const res = await fetch('/api/plano', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: { message: 'Erro desconhecido' } }));
    // Extrair mensagens de erro de forma mais clara
    let errorMessage = 'Falha ao adicionar exercício';
    if (errorData.error) {
      if (errorData.error.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.error.fieldErrors) {
        const fieldErrors = Object.entries(errorData.error.fieldErrors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        errorMessage = fieldErrors || errorMessage;
      } else if (errorData.error.formErrors) {
        errorMessage = Array.isArray(errorData.error.formErrors)
          ? errorData.error.formErrors.join(', ')
          : errorData.error.formErrors;
      }
    }
    throw new Error(errorMessage);
  }
  const data = (await res.json()) as ApiResponse<unknown>;
  return data.data;
}
