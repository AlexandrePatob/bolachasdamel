import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabase';

export async function GET() {
    try {
        const products = await getProducts();
        // Filtrar apenas os produtos favoritos (Só um mimo e Feliz Páscoa)
        const favorites = products.filter(product => 
            product.name === 'Só um mimo' || product.name === 'Feliz Páscoa'
        );
        return NextResponse.json(favorites);
    } catch (error) {
        console.error('Error fetching favorite products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch favorite products' },
            { status: 500 }
        );
    }
} 