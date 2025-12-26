import { get, post } from './apiClient';
import type { ApiResponse, DailyLogDTO, FoodIntakeLevel } from '@/types';

type RegistroInput = {
  waterLiters: number;
  foodIntake: FoodIntakeLevel;
  note?: string;
};

export async function obterRegistroDiario() {
  const res = await get<ApiResponse<DailyLogDTO | null>>('/registro-diario');
  return res.data;
}

export async function salvarRegistroDiario(payload: RegistroInput) {
  const res = await post<ApiResponse<DailyLogDTO>>('/registro-diario', payload);
  return res.data;
}
