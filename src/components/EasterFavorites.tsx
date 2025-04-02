"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Product } from "@/types/database";
import ChocolateOptionModal from "./ChocolateOptionModal";

interface EasterFavoritesProps {
  onOrderClick: (product: {
    id: string;
    product_id: string;
    name: string;
    price: number;
    image: string;
    has_chocolate_option: boolean;
    has_chocolate: boolean;
  }) => void;
}

const EasterFavorites = ({ onOrderClick }: EasterFavoritesProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showChocolateModal, setShowChocolateModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products/favorites', {
        next: { revalidate: 300 }, // Cache por 5 minutos
      });
      
      if (!response.ok) throw new Error('Failed to fetch favorite products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching favorite products:', error);
      toast.error('Erro ao carregar produtos favoritos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.has_chocolate_option) {
      setSelectedProduct(product);
      setShowChocolateModal(true);
    } else {
      onOrderClick({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        has_chocolate_option: product.has_chocolate_option,
        has_chocolate: false,
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
    }
  }, [onOrderClick]);

  const handleChocolateOption = useCallback((hasChocolate: boolean) => {
    if (!selectedProduct) return;

    onOrderClick({
      id: selectedProduct.id,
      product_id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image || '',
      has_chocolate_option: true,
      has_chocolate: hasChocolate,
    });

    toast.success(`${selectedProduct.name} adicionado ao carrinho!`, {
      duration: 2000,
      icon: "🛒",
      style: {
        background: "#FDF2F8",
        color: "#BE185D",
        border: "1px solid #FBCFE8",
      },
    });

    setShowChocolateModal(false);
    setSelectedProduct(null);
  }, [selectedProduct, onOrderClick]);

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
              Carregando produtos favoritos...
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
          Produtos Favoritos
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Nossos produtos mais queridos, feitos com todo carinho para sua Páscoa
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={false}
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

      <ChocolateOptionModal
        isOpen={showChocolateModal}
        onClose={() => {
          setShowChocolateModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleChocolateOption}
        product={selectedProduct || { name: '', image: '' }}
      />
    </section>
  );
};

export default EasterFavorites;
