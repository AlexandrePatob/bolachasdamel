import { NextResponse } from 'next/server';
import { updateOrderShippingFee } from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { shipping_fee } = await request.json();
    const updatedOrder = await updateOrderShippingFee(params.id, shipping_fee);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating shipping fee:', error);
    return NextResponse.json(
      { error: 'Failed to update shipping fee' },
      { status: 500 }
    );
  }
} 