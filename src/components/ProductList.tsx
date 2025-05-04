"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Product, ProductOption } from "@/types/database";
import ChocolateOptionModal from "./ChocolateOptionModal";
import ProductDetailsModal from "./ProductDetailsModal";
import { validateQuantity } from "@/lib/quantityRules";

interface ProductListProps {
  category: string;
  onOrderClick: (product: {
    id: string;
    product_id: string;
    name: string;
    price: number;
    image: string;
    has_chocolate_option: boolean;
    has_chocolate: boolean;
    selected_options?: ProductOption[];
    quantity: number;
  }) => void;
}

const ProductList = ({ category, onOrderClick }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showChocolateModal, setShowChocolateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "maes":
        return "Presentes para o Dia das Mães";
      case "fe":
        return "Produtos de Fé";
      case "pascoa":
        return "Produtos de Páscoa";
      case "outros":
        return "Outros Produtos";
      default:
        return "Produtos";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "maes":
        return "Presentes especiais para celebrar o amor e carinho das mães";
      case "fe":
        return "Produtos que inspiram e fortalecem a fé";
      case "pascoa":
        return "Deliciosas opções para celebrar a Páscoa";
      case "outros":
        return "Conheça nossa variedade de produtos";
      default:
        return "Nossos produtos";
    }
  };

  const getMinQty = (rules?: Product['product_quantity_rules']) => {
    if (!rules || rules.length === 0) return 1;
    return Math.min(...rules.map(r => r.min_qty));
  };

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`/api/products?category=${category}`, {
        next: { revalidate: 300 },
      });

      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      const minQty = getMinQty(product.product_quantity_rules);
      const validation = validateQuantity(minQty, product.product_quantity_rules);
      if (!validation.isValid && validation.message) {
        toast.error(validation.message);
        return;
      }

      if (product.has_chocolate_option) {
        setSelectedProduct(product);
        setShowChocolateModal(true);
      } else {
        onOrderClick({
          ...product,
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: validation.price || product.price,
          image: product.image || "",
          has_chocolate_option: product.has_chocolate_option,
          has_chocolate: false,
          quantity: minQty,
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
    },
    [onOrderClick]
  );

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleChocolateOption = useCallback(
    (hasChocolate: boolean) => {
      if (!selectedProduct) return;
      const minQty = getMinQty(selectedProduct.product_quantity_rules);
      const validation = validateQuantity(minQty, selectedProduct.product_quantity_rules);
      if (!validation.isValid && validation.message) {
        toast.error(validation.message);
        return;
      }

      onOrderClick({
        ...selectedProduct,
        id: selectedProduct.id,
        product_id: selectedProduct.id,
        name: selectedProduct.name,
        price: validation.price || selectedProduct.price,
        image: selectedProduct.image || "",
        has_chocolate_option: true,
        has_chocolate: hasChocolate,
        quantity: minQty,
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
    },
    [selectedProduct, onOrderClick]
  );

  if (loading) {
    return (
      <section className="w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
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
    <section className="w-full min-h-[80vh] bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-pink-600 mb-4 flex items-center justify-center space-x-2"
          >
            <span>{getCategoryTitle(category)}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg"
          >
            {getCategoryDescription(category)}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white"
            >
              <div
                className="relative w-full h-full cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <Image
                  src={product.image || ""}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base md:text-lg font-bold mb-1 text-white">
                        {product.name}
                      </h3>
                      <p className="text-xl md:text-2xl font-bold text-pink-200">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>Adicionar</span>
                      <span>🛒</span>
                    </button>
                  </div>
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

      {selectedProduct && (
        <ProductDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onAddToCart={onOrderClick}
        />
      )}
    </section>
  );
};

export default ProductList;
