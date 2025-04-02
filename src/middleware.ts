import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Verifica se a rota começa com /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Se não houver sessão e não estiver na página de login, redireciona
    if (!session && !request.nextUrl.pathname.startsWith('/admin/login')) {
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

// Configura em quais caminhos o middleware será executado
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}; 