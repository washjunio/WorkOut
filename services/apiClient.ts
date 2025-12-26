// Unica camada que acessa APIs (internas ou externas). Components e hooks nao chamam fetch diretamente.
const API_BASE = '/api';

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`GET ${path} falhou`);
  return response.json();
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`POST ${path} falhou`);
  return response.json();
}

// TODO: adicionar tratativa de auth (tokens/cookies) quando provider for definido.
