import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cache por 5 minutos
export const revalidate = 300;

export async function GET() {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                description,
                price,
                image,
                has_chocolate_option
            `)
            .eq('is_available', true)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching products:', error);
            return NextResponse.json(
                { error: 'Failed to fetch products' },
                { status: 500 }
            );
        }

        // Adiciona headers de cache
        const response = NextResponse.json(data);
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=59');
        
        return response;
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
} 