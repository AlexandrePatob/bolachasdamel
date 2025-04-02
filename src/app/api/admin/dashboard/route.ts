import { NextResponse } from 'next/server';
import { getAdminStats, getAdminOrders } from '@/lib/supabase';

export async function GET() {
    try {
        const [stats, orders] = await Promise.all([
            getAdminStats(),
            getAdminOrders()
        ]);

        return NextResponse.json({ stats, orders });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
} 