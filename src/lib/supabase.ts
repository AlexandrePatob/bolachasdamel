import { createClient } from "@supabase/supabase-js";
import { Order, OrderWithItems, CreateProductInput, ProductOptionInput, ProductQuantityRuleInput } from "@/types/database";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

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
            unit_quantity,
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

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, label, sort_order, is_featured")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

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
    .eq("category", "pascoa")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) throw error;
  return data;
}

// Customers
export async function createCustomer(customer: {
  name: string;
  email: string;
  phone: string;
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

  // Criar pedido (endereço removido - entrega combinada via WhatsApp)
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: existingCustomer.id,
      total_amount: orderData.total_amount,
      observations: orderData.observations || null,
      delivery_date: orderData.delivery_date,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Criar itens do pedido (unit_price vem do client quando calculado por regras)
  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_quantity: item.unit_quantity,
    unit_price:
      (item as { unit_price?: number }).unit_price ??
      products.find((p) => p.id === item.product_id)?.price ??
      0,
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

// Admin - date range helpers
function getDateRangeFromDays(days: number) {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);
  const to = new Date(today);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function getAdminStats(
  from?: string,
  to?: string,
  options?: { all?: boolean; days?: number }
) {
  let query = supabase.from("orders").select("*");

  if (options?.all) {
    // No date filter
  } else if (from && to) {
    query = query.gte("created_at", from).lte("created_at", to);
  } else {
    const days = options?.days ?? 15;
    const range = getDateRangeFromDays(days);
    query = query.gte("created_at", range.from).lte("created_at", range.to);
  }

  const { data: orders, error: ordersError } = await query;

  if (ordersError) throw ordersError;

  const total_orders = orders?.length ?? 0;
  const total_revenue = (orders ?? []).reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const orders_by_status = (orders ?? []).reduce((acc, order) => {
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

export async function getAdminOrders(
  from?: string,
  to?: string,
  options?: { all?: boolean; days?: number }
) {
  let query = supabase
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

  if (options?.all) {
    // No date filter
  } else if (from && to) {
    query = query.gte("created_at", from).lte("created_at", to);
  } else {
    const days = options?.days ?? 15;
    const range = getDateRangeFromDays(days);
    query = query.gte("created_at", range.from).lte("created_at", range.to);
  }

  const { data, error } = await query;

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

// ─── Admin: Products ────────────────────────────────────────────────────────

export async function getAllProductsAdmin() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(
      `
      id, name, description, price, image, has_chocolate_option,
      category, unit_quantity, is_available, created_at,
      product_options ( id, type, name, price_delta, image ),
      product_quantity_rules ( id, min_qty, max_qty, price, extra_per_unit )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProduct(data: CreateProductInput) {
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return product;
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>) {
  const { data: product, error } = await supabaseAdmin
    .from("products")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return product;
}

export async function setProductAvailability(id: string, available: boolean) {
  const { error } = await supabaseAdmin
    .from("products")
    .update({ is_available: available })
    .eq("id", id);

  if (error) throw error;
}

export async function upsertProductOptions(productId: string, options: ProductOptionInput[]) {
  const { error: deleteError } = await supabaseAdmin
    .from("product_options")
    .delete()
    .eq("product_id", productId);

  if (deleteError) throw deleteError;

  if (options.length === 0) return;

  const { error } = await supabaseAdmin
    .from("product_options")
    .insert(options.map((o) => ({ ...o, product_id: productId })));

  if (error) throw error;
}

export async function upsertProductQuantityRules(productId: string, rules: ProductQuantityRuleInput[]) {
  const { error: deleteError } = await supabaseAdmin
    .from("product_quantity_rules")
    .delete()
    .eq("product_id", productId);

  if (deleteError) throw deleteError;

  if (rules.length === 0) return;

  const { error } = await supabaseAdmin
    .from("product_quantity_rules")
    .insert(rules.map((r) => ({ ...r, product_id: productId })));

  if (error) throw error;
}

export async function uploadProductImage(file: File, fileName: string): Promise<string> {
  const BUCKET = "product-images";
  const path = `${Date.now()}-${fileName}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(publicUrl: string): Promise<void> {
  const BUCKET = "product-images";
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const path = publicUrl.split(marker)[1];
  if (!path) return;
  await supabaseAdmin.storage.from(BUCKET).remove([path]);
}

export async function upsertProductRpc(
  id: string | null,
  data: Partial<CreateProductInput>,
  options: ProductOptionInput[],
  rules: ProductQuantityRuleInput[]
) {
  const { data: result, error } = await supabaseAdmin.rpc("upsert_product", {
    p_id: id ?? null,
    p_data: data,
    p_options: options,
    p_rules: rules,
  });

  if (error) throw error;
  return result;
}

// ─── Admin: Categories ──────────────────────────────────────────────────────

export async function getAllCategoriesAdmin() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, label, sort_order, is_featured, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCategory(data: {
  label: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
}) {
  const { data: category, error } = await supabaseAdmin
    .from("categories")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function updateCategory(
  id: string,
  data: Partial<{ label: string; sort_order: number; is_featured: boolean; is_active: boolean }>
) {
  const { data: category, error } = await supabaseAdmin
    .from("categories")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function setCategoryActive(id: string, active: boolean) {
  const { error } = await supabaseAdmin
    .from("categories")
    .update({ is_active: active })
    .eq("id", id);

  if (error) throw error;
}
