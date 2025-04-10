export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'shipped' | 'delivered';

export interface CreateOrder {
    customer_id: string;
    total_amount: number;
    delivery_address: string;
    status?: OrderStatus;
    shipping_fee: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    has_chocolate_option: boolean;
    created_at: string;
    updated_at: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    has_chocolate: boolean;
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
        has_chocolate_option: boolean;
    };
}

export interface Order {
    id: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    observations: string | null;
    total_amount: number;
    shipping_fee: number;
    status: "pending" | "preparing" | "completed" | "shipped" | "delivered";
    delivery_date: string | null;
    created_at: string;
    updated_at: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        complement: string | null;
    };
    items: {
        id: string;
        order_id: string;
        product_id: string;
        quantity: number;
        unit_price: number;
        has_chocolate: boolean;
        product: {
            id: string;
            name: string;
            price: number;
            image: string;
            has_chocolate_option: boolean;
        };
    }[];
}

export interface OrderWithItems extends Omit<Order, 'customer' | 'items'> {
    customer: Customer;
    items: OrderItem[];
}

export interface CreateOrderData {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    complement?: string;
    observations?: string;
    delivery_date: string;
    items: {
        product_id: string;
        quantity: number;
        has_chocolate: boolean;
    }[];
} 