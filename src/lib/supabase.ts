import { createClient } from "@supabase/supabase-js";
import { Order, OrderWithItems } from "@/types/database";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Products
export async function getProducts(category?: string) {
  const query = supabase
    .from("products")
    .select(
      `
            id,
            name,
            description,
            price,
            image,
            has_chocolate_option,
            category,
            product_options (
              id,
              type,
              name,
              price_delta,
              image
            ),
            product_quantity_rules (
              id,
              min_qty,
              max_qty,
              price,
              extra_per_unit
            )
        `
    )
    .eq("is_available", true);

  if (category) {
    query.eq("category", category);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getFavorites() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
            id,
            name,
            description,
            price,
            image,
            has_chocolate_option
        `
    )
    .eq("is_available", true)
    .in("name", ["Só um mimo", "Feliz Páscoa"])
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// Customers
export async function createCustomer(customer: {
  name: string;
  email: string;
  phone: string;
  address: string;
}) {
  const { data, error } = await supabase
    .from("customers")
    .insert([customer])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Orders
export async function createOrderWithCustomer(orderData: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  complement?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_quantity: number;
    has_chocolate: boolean;
    selected_options?: { id: string }[];
  }[];
  observations?: string;
  delivery_date: string;
  total_amount: number;
}) {
  // Validar dados do pedido
  if (
    !orderData.customer_name ||
    !orderData.customer_email ||
    !orderData.customer_phone ||
    !orderData.customer_address ||
    !orderData.items ||
    orderData.items.length === 0 ||
    !orderData.delivery_date
  ) {
    throw new Error("Dados do pedido incompletos");
  }

  // Validar cada item do pedido
  for (const item of orderData.items) {
    if (!item.product_id || item.quantity <= 0 || item.unit_quantity <= 0) {
      throw new Error("Dados dos itens incompletos");
    }
  }

  // Verificar se o cliente já existe
  let { data: existingCustomer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("email", orderData.customer_email)
    .single();

  // Se o cliente não existe, criar um novo
  if (!existingCustomer) {
    const { data: newCustomer, error: createError } = await supabase
      .from("customers")
      .insert({
        name: orderData.customer_name,
        email: orderData.customer_email,
        phone: orderData.customer_phone,
        address: orderData.customer_address,
        complement: orderData.complement || null,
      })
      .select()
      .single();

    if (createError) throw createError;
    existingCustomer = newCustomer;
  } else {
    // Se o cliente existe, atualizar os dados
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        name: orderData.customer_name,
        phone: orderData.customer_phone,
        address: orderData.customer_address,
        complement: orderData.complement || null,
      })
      .eq("id", existingCustomer.id);

    if (updateError) throw updateError;
  }

  // Buscar produtos para calcular o total
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in(
      "id",
      orderData.items.map((item) => item.product_id)
    );

  if (productsError) throw productsError;

  // Criar pedido
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: existingCustomer.id,
      total_amount: orderData.total_amount,
      delivery_address: orderData.customer_address,
      observations: orderData.observations || null,
      delivery_date: orderData.delivery_date,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Criar itens do pedido
  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_quantity: item.unit_quantity,
    unit_price: products.find((p) => p.id === item.product_id)?.price || 0,
    has_chocolate: item.has_chocolate,
  }));

  const { data: createdOrderItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)
    .select();

  if (itemsError) throw itemsError;

  // Create order item options
  const orderItemOptions = orderData.items.flatMap((item, index) => 
    (item.selected_options || []).map(option => ({
      order_item_id: createdOrderItems[index].id,
      option_id: option.id
    }))
  );

  if (orderItemOptions.length > 0) {
    const { error: optionsError } = await supabase
      .from("order_item_options")
      .insert(orderItemOptions);

    if (optionsError) throw optionsError;
  }

  // Buscar o pedido completo com os itens e produtos
  const { data: completeOrder, error: completeOrderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(*),
      items:order_items(
        *,
        product:products(*),
        options:order_item_options(
          option:product_options(*)
        )
      )
    `
    )
    .eq("id", order.id)
    .single();

  if (completeOrderError) throw completeOrderError;

  return completeOrder;
}

export async function getOrder(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
            *,
            customer:customers(*),
            items:order_items(*)
        `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as OrderWithItems;
}

// Admin
export async function getAdminStats() {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*");

  if (ordersError) throw ordersError;

  const total_orders = orders.length;
  const total_revenue = orders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const orders_by_status = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total_orders,
    total_revenue,
    orders_by_status,
  };
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  // Buscar o pedido atualizado com suas relações
  const { data: updatedOrder, error: fetchError } = await supabase
    .from("orders")
    .select(
      `
            *,
            customer:customers(*),
            items:order_items(
              id,
              quantity,
              unit_price,
              product:products(name, image)
            )
          `
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!updatedOrder) {
    throw new Error("Pedido não encontrado");
  }

  if (error) throw error;
  return updatedOrder;
}

export async function updateOrderShippingFee(id: string, shipping_fee: number) {
  const { error } = await supabase
    .from("orders")
    .update({ shipping_fee })
    .eq("id", id);

  // Buscar o pedido atualizado com suas relações
  const { data: updatedOrder, error: fetchError } = await supabase
    .from("orders")
    .select(
      `
    *,
    customer:customers(*),
    items:order_items(
      id,
      quantity,
      unit_price,
      product:products(name, image)
    )
  `
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!updatedOrder) {
    throw new Error("Pedido não encontrado");
  }

  if (error) throw error;
  return updatedOrder;
}

export async function getAdminOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(*),
      items:order_items(
        *,
        product:products(*),
        options:order_item_options(
          option:product_options(*)
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) throw error;
}
