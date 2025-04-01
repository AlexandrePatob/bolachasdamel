"use client";
import React, { useEffect, useState } from "react";
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
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showChocolateModal, setShowChocolateModal] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/products/favorites");
        if (!response.ok) throw new Error("Failed to fetch favorites");
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast.error("Erro ao carregar favoritos");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleAddToCart = (product: Product) => {
    if (product.has_chocolate_option) {
      setSelectedProduct(product);
      setShowChocolateModal(true);
    } else {
      onOrderClick({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        has_chocolate_option: false,
        has_chocolate: false,
      });
      toast.success(`${product.name} Adicionado ao carrinho!`, {
        duration: 2000,
        icon: "🛒",
        style: {
          background: "#FDF2F8",
          color: "#BE185D",
          border: "1px solid #FBCFE8",
        },
      });
    }
  };

  const handleChocolateOption = (hasChocolate: boolean) => {
    if (!selectedProduct) return;

    onOrderClick({
      id: selectedProduct.id,
      product_id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image || "",
      has_chocolate_option: true,
      has_chocolate: hasChocolate,
    });

    toast.success(`${selectedProduct.name} Adicionado ao carrinho!`, {
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
  };

  if (loading) {
    return <section className="w-full py-16"></section>;
  }

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
                    src={product.image || ""}
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

      <ChocolateOptionModal
        isOpen={showChocolateModal}
        onClose={() => {
          setShowChocolateModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleChocolateOption}
        product={selectedProduct || { name: "", image: "" }}
      />
    </section>
  );
};

export default EasterFavorites;
