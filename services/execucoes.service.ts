import { get, post } from './apiClient';
import type { ApiResponse, ExerciseExecutionDTO, ExecutionType } from '@/types';

export type RegistrarExecucaoInput = {
  exerciseId: string;
  planExerciseId?: string;
  type: ExecutionType;
  reps?: number;
  weight?: number;
  durationSec?: number;
  notes?: string;
};

export async function registrarExecucao(payload: RegistrarExecucaoInput) {
  const res = await post<ApiResponse<ExerciseExecutionDTO>>('/execucoes', payload);
  return res.data;
}

export async function listarExecucoes(exerciseId: string, limit = 10) {
  const res = await get<ApiResponse<ExerciseExecutionDTO[]>>(`/execucoes?exerciseId=${exerciseId}&limit=${limit}`);
  return res.data;
}
