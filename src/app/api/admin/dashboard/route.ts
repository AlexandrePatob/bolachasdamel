import { NextResponse } from 'next/server';
import { getAdminStats, getAdminOrders } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const [stats, orders] = await Promise.all([
            getAdminStats(),
            getAdminOrders()
        ]);

        return NextResponse.json(
            { stats, orders },
            {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { 
                status: 500,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }
        );
    }
} 