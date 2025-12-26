import { prisma } from './prisma';

// Wrapper para autenticacao futura (ex: NextAuth, Clerk ou Auth.js).
// Responsavel por recuperar sessao do usuario e expor helpers para middlewares e server components.

export type SessionUser = {
  id: string;
  email: string;
};

// TODO: substituir por provider real. Enquanto isso, usamos um usuario de desenvolvimento.
const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@workout.app',
  name: 'Demo User',
};

export async function ensureDemoUser(): Promise<SessionUser> {
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER.id },
    update: {},
    create: DEMO_USER,
  });
  return { id: user.id, email: user.email };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  // TODO: integrar com provider real de autenticacao.
  return ensureDemoUser();
}
