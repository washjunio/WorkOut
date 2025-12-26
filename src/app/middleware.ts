import { NextResponse, type NextRequest } from 'next/server';

// Middleware placeholder para proteger rotas em (protected).
// OBS: Next espera middleware em /middleware.ts ou /src/middleware.ts; manter este arquivo
// conforme estrutura solicitada e mover quando ativar protecao real.
export function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith('/(protected)');

  if (isProtected) {
    // TODO: verificar sessao/usuario; redirecionar para /login se necessario.
    // Exemplo: if (!session) return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(protected)/(.*)'],
};
