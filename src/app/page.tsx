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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {  
  const [isCartOpen, setIsCartOpen] = useState(false);
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
  }) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [
        ...prevItems,
        {
          ...product,
          quantity: product.quantity || 1,
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

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
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
    { id: "outros", label: "Outros" }
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
          {activeCategory !== "sobre" && (
            <ProductList category={activeCategory} onOrderClick={handleOrderClick} />
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
        />
      </motion.main>
    </>
  );
}
