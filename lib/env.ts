// Centraliza leitura de variaveis de ambiente. Substituir por Zod quando instalar dependencias.

type Env = {
  DATABASE_URL: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

export const env: Env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/workout',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ivzgnkkdcobaclvilfxr.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_K97NHI6luK0St-e_JpqZAA_lKfUEXeJ',
};

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL nao configurada; defina no .env.local antes de subir para Vercel.');
}

// TODO: substituir por esquema Zod para validacao forte de envs.
