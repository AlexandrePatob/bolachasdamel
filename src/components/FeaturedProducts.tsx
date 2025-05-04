"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Product } from "@/types/database";
import ChocolateOptionModal from "./ChocolateOptionModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedProductsProps {
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

export default function FeaturedProducts({ onOrderClick }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showChocolateModal, setShowChocolateModal] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        next: { revalidate: 300 },
      });

      if (!response.ok) throw new Error("Failed to fetch featured products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      toast.error("Erro ao carregar produtos em destaque");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
  };

  if (loading) {
    return (
      <section className="w-full min-h-[50vh] flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
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
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-b from-pink-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-pink-600 mb-4"
          >
            Produtos em Destaque
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            Presentes especiais para celebrar o amor e carinho das mães
          </motion.p>
        </div>

        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 pb-4 min-w-max">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative w-[280px] aspect-square rounded-2xl overflow-hidden shadow-sm"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Image
                    src={product.image || ""}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${
                      hoveredProduct === product.id ? "scale-110" : "scale-100"
                    }`}
                    sizes="(max-width: 768px) 280px, 280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                    <p className="text-2xl font-bold">R$ {product.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-2 w-full bg-pink-600 text-white py-2 rounded-full hover:bg-pink-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>Adicionar</span>
                      <span>🛒</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
}
