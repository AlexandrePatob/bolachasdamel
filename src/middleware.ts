import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  // Verificar se é uma rota do admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Ignorar a página de login
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Verificar o token de autenticação
    const adminToken = request.cookies.get('admin_token')?.value;

    if (!adminToken) {
      // Redirecionar para a página de login com a URL atual como parâmetro
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);

      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verificar se o token é válido
      const { data: { user }, error } = await supabase.auth.getUser(adminToken);

      if (error || !user) {
        // Se o token for inválido, redirecionar para a página de login
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);

        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configura em quais caminhos o middleware será executado
export const config = {
  matcher: '/admin/:path*',
}; 