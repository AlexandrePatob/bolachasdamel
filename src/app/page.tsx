"use client";
import React, { useState } from "react";
import Hero from "../components/Hero";
import AboutUs from "../components/AboutUs";
import EasterFavorites from "../components/FeaturedProducts";
import FeaturedSection from "../components/FeaturedSection";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import Navigation from "../components/Navigation";
import CartModal from "../components/CartModal";
import CartIcon from "../components/CartIcon";
import { motion } from "framer-motion";
import { CartItem } from "@/types/cart";
import ProductList from "@/components/ProductList";
import KitBuilder from "@/components/KitBuilder";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    {
      id: "maes",
      label: "Dia das Mães",
    },
    {
      id: "sobre",
      label: "Quem Somos",
      content: <AboutUs />,
    },
  ];

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-[#ffe9f3] to-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Hero />
        </motion.div>
        <motion.div
          className="container mx-auto px-4 py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Navigation
            tabs={tabs}
            otherCategories={otherCategories}
            onCategoryChange={handleCategoryChange}
          />
          {activeCategory === "maes" && (
            <div className="mt-8">
              <motion.button
                onClick={() => setIsKitBuilderOpen(true)}
                className="relative w-full max-w-md mx-auto block bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-12 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 border-2 border-pink-300 rounded-lg"
                  animate={{
                    opacity: [1, 0.2, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(244, 114, 182, 0.8)",
                      "0 0 0 4px rgba(244, 114, 182, 0.2)",
                      "0 0 0 0 rgba(244, 114, 182, 0.8)"
                    ]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">
                    🎁 Monte seu Kit Exclusivo
                  </h3>
                  <p className="text-sm opacity-90">
                    Clique e crie um kit personalizado com os melhores produtos
                  </p>
                </div>
              </motion.button>
              <ProductList
                category={activeCategory}
                onOrderClick={handleOrderClick}
              />
            </div>
          )}
          {activeCategory !== "sobre" && activeCategory !== "maes" && (
            <ProductList
              category={activeCategory}
              onOrderClick={handleOrderClick}
            />
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Footer />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <WhatsAppButton />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <CartIcon
            itemCount={cartItems.length}
            onClick={() => setIsCartOpen(true)}
            isNewItem={isNewItem}
          />
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
