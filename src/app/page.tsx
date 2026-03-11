"use client";
import React, { useState } from "react";
import AboutUs from "../components/AboutUs";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import CartModal from "../components/CartModal";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { CartItem } from "@/types/cart";
import { Product, ProductOption } from "@/types/database";
import ProductList from "@/components/ProductList";
import KitBuilder from "@/components/KitBuilder";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isKitBuilderOpen, setIsKitBuilderOpen] = useState(false);
  const [isKitBuilder, setIsKitBuilder] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isNewItem, setIsNewItem] = useState(false);
  const [activeCategory, setActiveCategory] = useState("pascoa");

  const handleOrderClick = (product: Pick<Product, "id" | "name" | "price" | "image" | "has_chocolate_option" | "product_quantity_rules"> & {
    has_chocolate: boolean;
    quantity?: number;
    unit_quantity?: number;
    selected_options?: ProductOption[];
  }) => {
    const qty = product.quantity ?? 1;
    const unitQty = product.unit_quantity ?? 1;
    const optionsKey = (product.selected_options ?? [])
      .map((o) => o.id)
      .sort()
      .join(",");
    const itemId = `${product.id}_${unitQty}${product.has_chocolate ? "_choco" : ""}_${optionsKey}`;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) =>
          item.product_id === product.id &&
          item.unit_quantity === unitQty &&
          item.has_chocolate === product.has_chocolate &&
          ((item.selected_options ?? []).map((o) => o.id).sort().join(",") === optionsKey)
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.product_id === product.id &&
          item.unit_quantity === unitQty &&
          item.has_chocolate === product.has_chocolate &&
          ((item.selected_options ?? []).map((o) => o.id).sort().join(",") === optionsKey)
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prevItems,
        {
          ...product,
          id: itemId,
          quantity: qty,
          unit_quantity: unitQty,
          product_id: product.id,
          has_chocolate_option: product.has_chocolate_option,
          has_chocolate: product.has_chocolate,
          selected_options: product.selected_options ?? [],
        },
      ];
    });

    setIsCartOpen(true);
    setIsNewItem(true);
    setTimeout(() => setIsNewItem(false), 300);
  };

  const handleKitComplete = (kitItems: CartItem[]) => {
    setIsKitBuilder(true);
    setCartItems((prevItems) => [...prevItems, ...kitItems]);
    setIsKitBuilderOpen(false);
    setIsCartOpen(true);
    setIsNewItem(true);
    setTimeout(() => setIsNewItem(false), 300);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  return (
    <>
      <Header
        cartItemCount={cartItems.length}
        isNewItem={isNewItem}
        onCartClick={() => setIsCartOpen(true)}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-[#ffe9f3] to-white pt-[195px]"
      >
        <motion.div
          className="container mx-auto px-4 py-10 md:py-14"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {activeCategory === "sobre" && <AboutUs />}
          {activeCategory === "maes" && (
            <div className="space-y-10">
              <div className="text-center">
                <button
                  onClick={() => setIsKitBuilderOpen(true)}
                  className="inline-flex flex-col items-center gap-1 bg-pink-600 hover:bg-pink-700 text-white py-4 px-8 rounded-xl transition-colors duration-200"
                >
                  <span className="font-semibold text-lg">Monte seu Kit Exclusivo</span>
                  <span className="text-sm text-pink-100">
                    Crie um kit personalizado com os melhores produtos
                  </span>
                </button>
              </div>
              <ProductList category={activeCategory} onOrderClick={handleOrderClick} />
            </div>
          )}
          {activeCategory !== "sobre" && activeCategory !== "maes" && (
            <ProductList category={activeCategory} onOrderClick={handleOrderClick} />
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Footer />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <WhatsAppButton />
        </motion.div>
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          isKitBuilder={isKitBuilder}
        />
        <KitBuilder
          isOpen={isKitBuilderOpen}
          onClose={() => setIsKitBuilderOpen(false)}
          onComplete={handleKitComplete}
        />
      </motion.main>
    </>
  );
}
