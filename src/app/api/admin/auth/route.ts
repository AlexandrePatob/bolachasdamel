import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const data = await verifyAdminCredentials(email, password);

        // Define o cookie de autenticação
        const cookieStore = cookies();
        cookieStore.set('admin_token', data.session?.access_token || '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 dias
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Credenciais inválidas' },
            { status: 401 }
        );
    }
} 