import { createClient } from '@supabase/supabase-js';
import { Customer, Order, OrderItem, OrderWithItems, Product, CreateOrder } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<{
    products: Product;
    customers: Customer;
    orders: Order;
    order_items: OrderItem;
}>(supabaseUrl, supabaseAnonKey);

// Products
export async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true);
    
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
    .from('customers')
    .insert([customer])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Orders
export async function createOrder(order: CreateOrder, items: Omit<OrderItem, 'id' | 'created_at'>[]) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ ...order, status: 'pending' }])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map(item => ({
    ...item,
    order_id: orderData.id
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
}

export async function getOrder(id: string) {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            customer:customers(*),
            items:order_items(*)
        `)
        .eq('id', id)
        .single();
    
    if (error) throw error;
    return data as OrderWithItems;
} 