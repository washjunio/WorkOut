import { get, post } from './apiClient';
import type { ApiResponse, CardioSessionDTO } from '@/types';

type CardioSummary = { totalMinutes: number; sessions: CardioSessionDTO[] };

type RegistrarCardioInput = {
  modality: string;
  duration: number; // minutos
  distanceKm?: number;
  notes?: string;
};

export async function registrarCardio(payload: RegistrarCardioInput) {
  const res = await post<ApiResponse<CardioSessionDTO>>('/cardio', payload);
  return res.data;
}

export async function obterCardioSemanal() {
  const res = await get<ApiResponse<CardioSummary>>('/cardio');
  return res.data;
}
