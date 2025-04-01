export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    is_available: boolean;
    created_at: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string;
    created_at: string;
}

export interface Order {
    id: string;
    customer_id: string;
    total_amount: number;
    delivery_address: string;
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    created_at: string;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
    customer: Customer;
} 