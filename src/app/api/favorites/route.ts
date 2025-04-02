import { NextResponse } from 'next/server';
import { getFavorites } from '@/lib/supabase';

// Cache por 5 minutos
export const revalidate = 300;

export async function GET() {
    try {
        const favorites = await getFavorites();
        
        // Adiciona headers de cache
        const response = NextResponse.json(favorites);
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=59');
        
        return response;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json(
            { error: 'Failed to fetch favorites' },
            { status: 500 }
        );
    }
} 