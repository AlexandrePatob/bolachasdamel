import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CreateOrderData } from "@/types/database";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const data: CreateOrderData = await request.json();

    // Validar dados do pedido
    if (!data.customer_name || !data.customer_email || !data.customer_phone || !data.customer_address || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "Dados do pedido incompletos" },
        { status: 400 }
      );
    }

    // Validar cada item do pedido
    for (const item of data.items) {
      if (!item.product_id || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Dados dos itens incompletos" },
          { status: 400 }
        );
      }
    }

    // Verificar se o cliente já existe
    let { data: existingCustomer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", data.customer_email)
      .single();

    // Se o cliente não existe, criar um novo
    if (!existingCustomer) {
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          name: data.customer_name,
          email: data.customer_email,
          phone: data.customer_phone,
          address: data.customer_address,
          complement: data.complement || null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Erro ao criar cliente:", createError);
        return NextResponse.json(
          { error: "Erro ao criar cliente" },
          { status: 500 }
        );
      }

      existingCustomer = newCustomer;
    } else {
      // Se o cliente existe, atualizar os dados
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          name: data.customer_name,
          phone: data.customer_phone,
          address: data.customer_address,
          complement: data.complement || null,
        })
        .eq("id", existingCustomer.id);

      if (updateError) {
        console.error("Erro ao atualizar cliente:", updateError);
        return NextResponse.json(
          { error: "Erro ao atualizar cliente" },
          { status: 500 }
        );
      }
    }

    // Buscar produtos para calcular o total
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in(
        "id",
        data.items.map((item) => item.product_id)
      );

    if (productsError) {
      console.error("Erro ao buscar produtos:", productsError);
      return NextResponse.json(
        { error: "Erro ao buscar produtos" },
        { status: 500 }
      );
    }

    // Calcular total do pedido
    const total_amount = data.items.reduce((total, item) => {
      const product = products.find((p) => p.id === item.product_id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: existingCustomer.id,
        total_amount,
        delivery_address: data.customer_address,
        observations: data.observations || null,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Erro ao criar pedido:", orderError);
      return NextResponse.json(
        { error: "Erro ao criar pedido" },
        { status: 500 }
      );
    }

    // Criar itens do pedido
    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: products.find((p) => p.id === item.product_id)?.price || 0,
      has_chocolate: item.has_chocolate,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Erro ao criar itens do pedido:", itemsError);
      return NextResponse.json(
        { error: "Erro ao criar itens do pedido" },
        { status: 500 }
      );
    }

    // Buscar o pedido completo com os itens e produtos
    const { data: completeOrder, error: completeOrderError } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq("id", order.id)
      .single();

    if (completeOrderError) {
      console.error("Erro ao buscar pedido completo:", completeOrderError);
      return NextResponse.json(
        { error: "Erro ao buscar pedido completo" },
        { status: 500 }
      );
    }

    return NextResponse.json(completeOrder);
  } catch (error) {
    console.error("Erro ao processar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao processar pedido" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(*),
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return NextResponse.json(
        { error: "Erro ao buscar pedidos" },
        { status: 500 }
      );
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}
