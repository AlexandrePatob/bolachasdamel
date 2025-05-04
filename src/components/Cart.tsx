import { useState } from "react";
import CartIcon from "./CartIcon";
import CartModal from "./CartModal";
import { CartItem } from "@/types/cart";

export default function Cart() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isNewItem, setIsNewItem] = useState(false);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setItems([]);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <CartIcon
        itemCount={items.length}
        onClick={handleOpenModal}
        isNewItem={isNewItem}
      />

      <CartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        items={items as import("@/lib/cart").CartItem[]}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </>
  );
}
