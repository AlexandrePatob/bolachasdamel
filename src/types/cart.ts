import { ProductQuantityRule } from "./database";

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  has_chocolate_option: boolean;
  has_chocolate: boolean;
  quantity: number;
  unit_quantity: number;
  product_quantity_rules?: ProductQuantityRule[];
}