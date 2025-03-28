"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isBestSeller?: boolean;
}

interface ProductListProps {
  onOrderClick: (product: { id: number; name: string; price: number; image: string }) => void;
}

const products: Product[] = [
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
    name: "Lembrancinha",
    description:
      "3 bolachas sortidas: amanteigada, cacau com mel e amanteigada com chocolate",
    price: 7.0,
    image: "/images/lembrancinha.jpg",
  },
  {
    id: 3,
    name: "Para não passar em branco",
    description: "4 bolachas sortidas: 2 amanteigados e 2 cacau com chocolate",
    price: 8.0,
    image: "/images/para-nao-passar-em-branco.jpg",
  },
  {
    id: 4,
    name: "Presentinho",
    description: "4 palitos de chocolate com ou sem cobertura de chocolate",
    price: 13.9,
    image: "/images/presentinho.jpg",
  },
  {
    id: 5,
    name: "Agrado",
    description: "4 biscoitos amanteigados",
    price: 12.0,
    image: "/images/agrado.jpg",
  },
  {
    id: 6,
    name: "Regalo",
    description: "4 biscoitos cacau e mel",
    price: 11.0,
    image: "/images/regalo.jpg",
  }
];

const ProductList = ({ onOrderClick }: ProductListProps) => {
  const handleAddToCart = (product: Product) => {
    onOrderClick(product);
    toast.success(`${product.name} adicionado ao carrinho!`, {
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
    <section className="w-full py-16 bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-pink-600 mb-4">
          Produtos de Páscoa 2025
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Deliciosos produtos artesanais feitos com amor e carinho para sua
          Páscoa
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
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
                <p className="text-gray-600 mb-4 flex-grow">{product.description}</p>
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

export default ProductList;
