"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ShoppingCart, Settings2, ChevronRight } from "lucide-react";
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

const SkeletonCard = () => (
  <div className="bg-white border border-rose-100 rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex items-center justify-between mt-3">
        <div className="h-5 bg-gray-100 rounded w-1/3" />
        <div className="h-9 bg-gray-100 rounded-lg w-24" />
      </div>
    </div>
  </div>
);

const ProductList = ({ category, onOrderClick, showTitle = true, isKitBuilder = false }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showChocolateModal, setShowChocolateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "maes": return "Presentes para o Dia das Mães";
      case "fe": return "Produtos de Fé";
      case "pascoa": return "Páscoa 2026 - Presentes Especiais";
      case "outros": return "Outros Produtos";
      default: return "Produtos";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "maes": return "Presentes especiais para celebrar o amor e carinho das mães";
      case "fe": return "Produtos que inspiram e fortalecem a fé";
      case "pascoa": return "Delícias artesanais para celebrar a Páscoa 2026";
      case "outros": return "Conheça nossa variedade de produtos";
      default: return "Nossos produtos";
    }
  };

  const getMinQty = (rules?: Product['product_quantity_rules']) => {
    if (!rules || rules.length === 0) return 1;
    return Math.min(...rules.map(r => r.min_qty));
  };

  const getMinPrice = (rules?: Product['product_quantity_rules']) => {
    if (!rules || rules.length === 0) return null;
    const prices = rules.map(r => r.price_per_unit ?? 0).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
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
      const validation = validateQuantity(minQty, product.unit_quantity, product.product_quantity_rules);
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
        toast.success(`${product.name} adicionado ao ${isKitBuilder ? "kit" : "carrinho"}!`, {
          duration: 2000,
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
      const validation = validateQuantity(minQty, selectedProduct.unit_quantity, selectedProduct.product_quantity_rules);
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

      toast.success(`${selectedProduct.name} adicionado ao ${isKitBuilder ? "kit" : "carrinho"}!`, {
        duration: 2000,
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

  const hasOptions = (product: Product) =>
    product.has_chocolate_option ||
    (product.product_quantity_rules && product.product_quantity_rules.length > 0);

  if (loading) {
    return (
      <section className="w-full">
        <div className={`grid grid-cols-1 ${showTitle ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-2"} gap-6`}>
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
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-800"
          >
            {getCategoryTitle(category)}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 mt-2 max-w-xl mx-auto"
          >
            {getCategoryDescription(category)}
          </motion.p>
        </div>
      )}

      <div className={`grid grid-cols-1 ${showTitle ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-2"} gap-6`}>
        {products?.map((product, index) => {
          const minPrice = getMinPrice(product.product_quantity_rules);
          const displayPrice = product.price > 0
            ? `R$ ${product.price.toFixed(2)}`
            : minPrice
            ? `A partir de R$ ${minPrice.toFixed(2)}`
            : "Preço sob consulta";
          const hasRule = product.product_quantity_rules && product.product_quantity_rules.length > 0;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-rose-100 transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 shrink-0">
                <Image
                  src={product.image || ""}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                />
                <span className="absolute top-2 left-2 bg-white/95 text-pink-600 text-[10px] font-semibold px-2 py-1 rounded-md border border-pink-100">
                  Artesanal
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1 min-h-0">
                <h3 className="text-sm md:text-base font-semibold text-gray-800 leading-tight line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-[10px] md:text-xs text-rose-400 mt-0.5 mb-2">
                  Feito com amor ✨
                </p>

                {hasOptions(product) && (
                  <div className="flex items-center gap-1 mb-3">
                    <motion.span
                      className="flex items-center gap-1.5 text-xs font-medium text-pink-600 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-full cursor-pointer shadow-sm group-hover:bg-pink-100 group-hover:border-pink-300 group-hover:shadow-md transition-all duration-200"
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Settings2 className="w-3.5 h-3.5 text-pink-500" />
                      Ver opções
                      <ChevronRight className="w-3.5 h-3.5 text-pink-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </motion.span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 mt-auto">
                  <p className="text-sm md:text-base font-bold text-pink-600">
                    {displayPrice}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
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
