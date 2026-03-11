"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import { Product, ProductOption } from "@/types/database";
import ChocolateOptionModal from "./ChocolateOptionModal";
import ProductDetailsModal from "./ProductDetailsModal";
import { validateQuantity } from "@/lib/quantityRules";

interface ProductListProps {
  category: string;
  showTitle?: boolean;
  isKitBuilder?: boolean;
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
    unit_quantity: number;
  }) => void;
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-pink-50 animate-pulse">
      <div className="aspect-square bg-pink-100/60" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-pink-100 rounded-full w-3/4" />
        <div className="h-3 bg-pink-50 rounded-full w-1/2" />
        <div className="h-8 bg-pink-100 rounded-xl mt-2" />
      </div>
    </div>
  );
}

const getCategoryTitle = (category: string) => {
  switch (category) {
    case "maes": return "Presentes para o Dia das Mães";
    case "fe": return "Produtos de Fé";
    case "pascoa": return "Produtos de Páscoa";
    case "outros": return "Outros Produtos";
    default: return "Produtos";
  }
};

const getCategoryDescription = (category: string) => {
  switch (category) {
    case "maes": return "Presentes especiais para celebrar o amor e carinho das mães";
    case "fe": return "Produtos que inspiram e fortalecem a fé";
    case "pascoa": return "Deliciosas opções para celebrar a Páscoa";
    case "outros": return "Conheça nossa variedade de produtos";
    default: return "Nossos produtos";
  }
};

const getMinQty = (rules?: Product["product_quantity_rules"]) => {
  if (!rules || rules.length === 0) return 1;
  return Math.min(...rules.map((r) => r.min_qty));
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
  }),
};

const ProductList = ({
  category,
  onOrderClick,
  showTitle = true,
  isKitBuilder = false,
}: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showChocolateModal, setShowChocolateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      const validation = validateQuantity(
        minQty,
        product.unit_quantity,
        product.product_quantity_rules
      );
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
          unit_quantity: product.unit_quantity,
        });
        toast.success(
          `${product.name} adicionado ao ${isKitBuilder ? "kit" : "carrinho"}!`,
          {
            duration: 2000,
            style: { background: "#FDF2F8", color: "#BE185D", border: "1px solid #FBCFE8" },
          }
        );
      }
    },
    [onOrderClick, isKitBuilder]
  );

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleChocolateOption = useCallback(
    (hasChocolate: boolean) => {
      if (!selectedProduct) return;
      const minQty = getMinQty(selectedProduct.product_quantity_rules);
      const validation = validateQuantity(
        minQty,
        selectedProduct.unit_quantity,
        selectedProduct.product_quantity_rules
      );
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
        unit_quantity: selectedProduct.unit_quantity,
      });

      toast.success(
        `${selectedProduct.name} adicionado ao ${isKitBuilder ? "kit" : "carrinho"}!`,
        {
          duration: 2000,
          style: { background: "#FDF2F8", color: "#BE185D", border: "1px solid #FBCFE8" },
        }
      );

      setShowChocolateModal(false);
      setSelectedProduct(null);
    },
    [selectedProduct, onOrderClick, isKitBuilder]
  );

  const hasOptions = (product: Product) =>
    product.has_chocolate_option ||
    (product.product_quantity_rules && product.product_quantity_rules.length > 0);

  // Loading skeleton grid
  if (loading) {
    return (
      <section className="w-full">
        {showTitle && (
          <div className="text-center mb-8 space-y-2">
            <div className="h-8 bg-pink-100 rounded-full w-64 mx-auto animate-pulse" />
            <div className="h-4 bg-pink-50 rounded-full w-48 mx-auto animate-pulse" />
          </div>
        )}
        <div className={`grid grid-cols-2 ${showTitle ? "md:grid-cols-3" : "md:grid-cols-2"} gap-3 md:gap-4`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      {showTitle && (
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-pink-700 mb-2"
          >
            {getCategoryTitle(category)}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-gray-400 text-sm md:text-base max-w-md mx-auto"
          >
            {getCategoryDescription(category)}
          </motion.p>
        </div>
      )}

      <div
        className={`grid grid-cols-2 ${
          showTitle ? "md:grid-cols-3" : "md:grid-cols-2"
        } gap-3 md:gap-5`}
      >
        {products?.map((product, index) => (
          <motion.div
            key={product.id}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-pink-50/80 transition-shadow duration-300 cursor-pointer flex flex-col"
            onClick={() => handleProductClick(product)}
          >
            {/* Product image */}
            <div className="relative aspect-square overflow-hidden bg-pink-50/40">
              <Image
                src={product.image || ""}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-pink-900/0 group-hover:bg-pink-900/10 transition-colors duration-300" />

              {/* Options badge */}
              {hasOptions(product) && (
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                  <Settings2 className="w-3 h-3 text-pink-500" />
                  <span className="text-[10px] text-pink-600 font-medium">Opções</span>
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="p-3 flex flex-col flex-1">
              <h3 className="text-sm md:text-base font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">
                {product.name}
              </h3>

              {product.price > 0 && (
                <p className="text-pink-600 font-bold text-base md:text-lg mb-3 tabular-nums">
                  R$ {product.price.toFixed(2)}
                </p>
              )}

              <div className="mt-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white text-sm font-medium py-2 rounded-xl border border-pink-200 hover:border-pink-600 transition-all duration-200 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Adicionar</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
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
