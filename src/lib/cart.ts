import { Product } from "@/types/database";

export interface CartItem {
  id: string; // Será uma combinação do ID do produto + opção de chocolate
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  has_chocolate_option: boolean;
  has_chocolate: boolean;
}

// Função para gerar um ID único para o item do carrinho baseado no produto e opção de chocolate
const generateCartItemId = (productId: string, hasChocolate: boolean): string => {
  return `${productId}${hasChocolate ? '_chocolate' : '_plain'}`;
};

export const addToCart = (product: Product, quantity: number = 1, hasChocolate: boolean = false): void => {
  const cartItems = getCartItems();
  
  const cartItemId = generateCartItemId(product.id, hasChocolate);
  const existingItemIndex = cartItems.findIndex(item => item.id === cartItemId);

  if (existingItemIndex > -1) {
    // Se o item já existe (mesmo produto e mesma opção de chocolate), atualiza a quantidade
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Se não existe, adiciona como um novo item
    cartItems.push({
      id: cartItemId,
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      has_chocolate_option: product.has_chocolate_option,
      has_chocolate: hasChocolate,
    });
  }

  localStorage.setItem('cartItems', JSON.stringify(cartItems));
};

export const updateCartItemQuantity = (itemId: string, quantity: number, hasChocolate?: boolean): void => {
  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === itemId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      cartItems.splice(itemIndex, 1);
    } else {
      cartItems[itemIndex] = {
        ...cartItems[itemIndex],
        quantity,
        ...(hasChocolate !== undefined && { has_chocolate: hasChocolate }),
      };
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }
};

export const removeFromCart = (itemId: string): void => {
  const cartItems = getCartItems();
  const updatedItems = cartItems.filter(item => item.id !== itemId);
  localStorage.setItem('cartItems', JSON.stringify(updatedItems));
};

export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  const items = localStorage.getItem('cartItems');
  return items ? JSON.parse(items) : [];
};

export const clearCart = (): void => {
  localStorage.removeItem('cartItems');
}; 