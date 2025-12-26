import { get, post } from './apiClient';
import type { ApiResponse, ExerciseDTO } from '@/types';

// Lista exercicios do usuario (ou seeds globais).
export async function listarExercicios(): Promise<ExerciseDTO[]> {
  const res = await get<ApiResponse<ExerciseDTO[]>>('/exercicios');
  return res.data;
}

export async function criarExercicio(payload: Pick<ExerciseDTO, 'name' | 'muscleGroup' | 'type'>) {
  const res = await post<ApiResponse<ExerciseDTO>>('/exercicios', payload);
  return res.data;
}
