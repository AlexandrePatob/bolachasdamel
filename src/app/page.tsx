"use client";
import React, { useState } from "react";
import Hero from "../components/Hero";
import AboutUs from "../components/AboutUs";
import EasterFavorites from "../components/EasterFavorites";
import ProductList from "../components/ProductList";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import Navigation from "../components/Navigation";
import CartModal from "../components/CartModal";
import CartIcon from "../components/CartIcon";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleOrderClick = (product: {
    id: number;
    name: string;
    price: number;
    image: string;
  }) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    //setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const tabs = [
    {
      id: "produtos",
      label: "Produtos",
      content: (
        <>
          <EasterFavorites onOrderClick={handleOrderClick} />
          <ProductList onOrderClick={handleOrderClick} />
        </>
      ),
    },
    {
      id: "sobre",
      label: "Quem Somos",
      content: <AboutUs />,
    },
  ];

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          position: 'top-right',
          duration: 1700,
          style: {
            background: "#FDF2F8",
            color: "#BE185D",
            border: "1px solid #FBCFE8",
          },
        }}
      />
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
          <Navigation tabs={tabs} />
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
          />
        </motion.div>
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      </motion.main>
    </>
  );
}
