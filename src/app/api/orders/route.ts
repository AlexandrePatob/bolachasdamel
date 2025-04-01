import { NextResponse } from "next/server";
import { createCustomer, createOrder } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { customer, items } = await request.json();

    // Criar cliente
    const customerData = await createCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: `${customer.address}, ${customer.number}`,
    });

    if (!customerData) throw new Error('Failed to create customer');

    // Criar pedido com os itens
    const orderData = await createOrder(
      {
        customer_id: customerData.id,
        total_amount: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        delivery_address: `${customer.address}, ${customer.number}`,
      },
      items.map((item: any) => ({
        order_id: '', // Será preenchido pela função createOrder
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        customer: customerData,
        order: orderData,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
