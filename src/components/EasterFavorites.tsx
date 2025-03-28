"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface EasterFavoritesProps {
  onOrderClick: (product: {
    id: number;
    name: string;
    price: number;
    image: string;
  }) => void;
}

const favorites = [
  {
    id: 1,
    name: "Só um mimo",
    description: "Bolacha amanteigado Páscoa ou coelho.",
    price: 3.0,
    image: "/images/so-um-mimo.jpg",
    isBestSeller: true,
  },
  {
    id: 2,
    name: "Feliz Páscoa",
    description: "6 palitos amanteigados com ou sem chocolate",
    price: 16.0,
    image: "/images/feliz-pascoa.jpg",
  },
];

const EasterFavorites = ({ onOrderClick }: EasterFavoritesProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = (product: any) => {
    onOrderClick(product);
    toast.success(`${product.name} Adicionado ao carrinho!`, {
      duration: 2000,
      icon: "🛒",
      style: {
        background: "#FDF2F8",
        color: "#BE185D",
        border: "1px solid #FBCFE8",
      },
    });
  };
  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-pink-600 mb-4">
          Favoritos da Páscoa
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Os produtos mais amados pelos nossos clientes
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {favorites.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 p-6"
            >
              <div className="relative w-full aspect-[4/3] mb-6">
                <div className="absolute inset-0 rounded-xl overflow-hidden border-4 border-pink-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {product.isBestSeller && (
                  <div className="absolute -top-2 -right-2 bg-rose-200 text-rose-700 rounded-full px-2 py-0.5 text-xs font-medium">
                    Mais vendido
                  </div>
                )}
              </div>
              <div className="text-center flex flex-col flex-1 w-full">
                <h3 className="text-xl font-semibold text-pink-600 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  {product.description}
                </p>
                <div className="flex flex-col items-center space-y-4 mt-auto pt-4">
                  <p className="text-pink-500 font-bold text-xl">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Adicionar ao carrinho</span>
                    <span>🛒</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EasterFavorites;
