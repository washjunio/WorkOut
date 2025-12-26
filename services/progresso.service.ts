import { get } from './apiClient';
import type { ApiResponse } from '@/types';

type GrupoProgresso = {
  muscleGroup: string;
  alvoSeries: number;
  seriesExecutadas: number;
  percentual: number;
};

type ProgressoPayload = {
  grupos: GrupoProgresso[];
  cardio: { total: number; meta: number; percentual: number };
};

export async function obterProgressoSemanal() {
  const res = await get<ApiResponse<ProgressoPayload>>('/progresso');
  return res.data;
}
