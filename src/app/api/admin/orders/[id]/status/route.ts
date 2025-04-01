import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { OrderStatus } from '@/types/database';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { status } = await request.json();
    
    // Primeiro, verificar se o pedido existe
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', params.id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o status do pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: status as OrderStatus })
      .eq('id', params.id);

    if (updateError) throw updateError;

    // Buscar o pedido atualizado com suas relações
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(
          id,
          quantity,
          unit_price,
          product:products(name, image)
        )
      `)
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Erro ao buscar pedido atualizado' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status do pedido' },
      { status: 500 }
    );
  }
} 