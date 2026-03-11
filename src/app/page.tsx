"use client";
import React, { useState } from "react";
import Hero from "../components/Hero";
import AboutUs from "../components/AboutUs";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import Navigation from "../components/Navigation";
import CartModal from "../components/CartModal";
import CartIcon from "../components/CartIcon";
import { motion } from "framer-motion";
import { CartItem } from "@/types/cart";
import ProductList from "@/components/ProductList";
import KitBuilder from "@/components/KitBuilder";
import { Gift } from "lucide-react";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isKitBuilderOpen, setIsKitBuilderOpen] = useState(false);
  const [isKitBuilder, setIsKitBuilder] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isNewItem, setIsNewItem] = useState(false);
  const [activeCategory, setActiveCategory] = useState("maes");

  const handleOrderClick = (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    has_chocolate_option: boolean;
    has_chocolate: boolean;
    quantity?: number;
    unit_quantity?: number;
  }) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, unit_quantity: item.unit_quantity + (product.unit_quantity || 1) }
            : item
        );
      }
      return [
        ...prevItems,
        {
          ...product,
          quantity: product.quantity || 1,
          unit_quantity: product.unit_quantity || 1,
          product_id: product.id,
          has_chocolate_option: product.has_chocolate_option,
          has_chocolate: product.has_chocolate,
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

  const otherCategories = [
    { id: "fe", label: "Fé" },
    { id: "pascoa", label: "Páscoa" },
    { id: "outros", label: "Outros" },
  ];

  const tabs = [
    { id: "maes", label: "Dia das Mães" },
    { id: "sobre", label: "Quem Somos", content: <AboutUs /> },
  ];

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gradient-to-b from-[#ffe9f3] to-white"
      >
        <Hero />

        <div className="container mx-auto px-4 py-8 max-w-2xl md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Navigation
              tabs={tabs}
              otherCategories={otherCategories}
              onCategoryChange={handleCategoryChange}
            />
          </motion.div>

          {activeCategory === "maes" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {/* Kit Builder banner — elegant, not loud */}
              <motion.button
                onClick={() => setIsKitBuilderOpen(true)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full flex items-center gap-4 bg-white border border-pink-100 rounded-2xl px-5 py-4 mb-8 shadow-sm hover:shadow-md hover:border-pink-200 transition-all duration-200 cursor-pointer text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-pink-500" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    Monte seu Kit Exclusivo
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Crie um kit personalizado com os melhores produtos
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-pink-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              <ProductList category={activeCategory} onOrderClick={handleOrderClick} />
            </motion.div>
          )}

          {activeCategory !== "sobre" && activeCategory !== "maes" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <ProductList category={activeCategory} onOrderClick={handleOrderClick} />
            </motion.div>
          )}
        </div>

        <Footer />

        <WhatsAppButton />

        <CartIcon
          itemCount={cartItems.length}
          onClick={() => setIsCartOpen(true)}
          isNewItem={isNewItem}
        />

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
