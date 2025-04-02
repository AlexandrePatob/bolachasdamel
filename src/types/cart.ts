export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  has_chocolate_option: boolean;
  has_chocolate: boolean;
}