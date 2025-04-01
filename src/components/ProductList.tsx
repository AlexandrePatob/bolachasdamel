"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Product } from "@/types/database";

interface ProductListProps {
  onOrderClick: (product: { id: string; name: string; price: number; image: string }) => void;
}

const ProductList = ({ onOrderClick }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    onOrderClick({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || ''
    });
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

  if (loading) {
    return (
      <section className="w-full py-16 bg-gradient-to-b from-pink-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full"
            />
            <motion.p
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-xl font-medium text-pink-600"
            >
              Carregando produtos...
            </motion.p>
          </div>
        </div>
      </section>
    );
  }

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
                    src={product.image || ''}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
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
