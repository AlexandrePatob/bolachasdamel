import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/supabase';
import { OrderStatus } from '@/types/database';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const updatedOrder = await updateOrderStatus(params.id, status as OrderStatus);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 