import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats, getAdminOrders } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getDateRangeFromDays(days: number) {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);
    const to = new Date(today);
    to.setHours(23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';
        const daysParam = searchParams.get('days');
        const days = daysParam ? parseInt(daysParam, 10) : 15;
        const validDays = days > 0 ? days : 15;

        const options = all ? { all: true } : { days: validDays };
        const range = all ? null : getDateRangeFromDays(validDays);

        const [stats, orders] = await Promise.all([
            getAdminStats(undefined, undefined, options),
            getAdminOrders(undefined, undefined, options)
        ]);

        return NextResponse.json(
            { stats, orders, dateRange: range, all },
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