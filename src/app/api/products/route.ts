import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabase';

// Cache por 5 minutos
export const revalidate = 300;

export async function GET() {
    try {
        const products = await getProducts();
        
        // Adiciona headers de cache
        const response = NextResponse.json(products);
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