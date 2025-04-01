import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Order, OrderStatus } from '@/types/database';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(
          id,
          quantity,
          unit_price,
          has_chocolate,
          product:products(name, image, has_chocolate_option)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calcular estatísticas para cada estado
    const stats = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
      orders_by_status: {
        pending: orders.filter((order: Order) => order.status === 'pending').length,
        preparing: orders.filter((order: Order) => order.status === 'preparing').length,
        completed: orders.filter((order: Order) => order.status === 'completed').length,
        shipped: orders.filter((order: Order) => order.status === 'shipped').length,
        delivered: orders.filter((order: Order) => order.status === 'delivered').length,
      }
    };

    return NextResponse.json({ orders, stats });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    );
  }
} 