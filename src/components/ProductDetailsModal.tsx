import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Product, ProductOption } from "@/types/database";
import { X } from "lucide-react";
import { validateQuantity } from "@/lib/quantityRules";
import toast from "react-hot-toast";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: {
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

const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: ProductDetailsModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<ProductOption[]>([]);
  const getMinQty = (rules?: Product["product_quantity_rules"]) => {
    if (!rules || rules.length === 0) return 1;
    return Math.min(...rules.map((r) => r.min_qty));
  };

  const minQty = getMinQty(product.product_quantity_rules);
  const [quantity, setQuantity] = useState(minQty);
  const [unitQuantity, setUnitQuantity] = useState(1);

  const calculateTotalPrice = () => {
    const optionsPrice = selectedOptions.reduce(
      (sum, option) => sum + option.price_delta,
      0
    );
    const validation = validateQuantity(
      quantity,
      unitQuantity,
      product.product_quantity_rules
    );
    const basePrice = validation.price || product.price;

    if (optionsPrice > 0 && !validation.price) {
      return optionsPrice * unitQuantity;
    }

    return validation.price
      ? basePrice + optionsPrice * unitQuantity
      : basePrice * unitQuantity;
  };

  const calculateUnitPrice = () => {
    const optionsPrice = selectedOptions.reduce(
      (sum, option) => sum + option.price_delta,
      0
    );
    const validation = validateQuantity(
      quantity,
      unitQuantity,
      product.product_quantity_rules
    );
    const rulePrice = validation.price || product.price;
    return rulePrice + optionsPrice;
  };

  const handleOptionSelect = (option: ProductOption) => {
    setSelectedOptions([option]);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < minQty) {
      toast.error(
        `Quantidade mínima é ${minQty} unidade${minQty > 1 ? "s" : ""}`
      );
      return;
    }
    setQuantity(newQuantity);
  };

  const handleUnitQuantityChange = (newUnitQuantity: number) => {
    if (newUnitQuantity < 1) {
      toast.error("Quantidade de unidades deve ser maior que zero");
      return;
    }
    setUnitQuantity(newUnitQuantity);
  };

  const handleAddToCart = () => {
    const validation = validateQuantity(
      quantity,
      unitQuantity,
      product.product_quantity_rules
    );
    if (!validation.isValid && validation.message) {
      toast.error(validation.message);
      return;
    }

    onAddToCart({
      ...product,
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: calculateUnitPrice(),
      image: selectedOptions[0]?.image || product.image,
      has_chocolate_option: product.has_chocolate_option,
      has_chocolate: false,
      selected_options: selectedOptions,
      quantity: quantity,
      unit_quantity: unitQuantity,
    });
    onClose();
  };

  // Função para gerar descrição das regras de preço
  function getPriceDescription(rules?: Product["product_quantity_rules"]) {
    if (!rules || rules.length === 0) return "";

    // Ordena as regras por min_qty
    const sorted = [...rules].sort((a, b) => a.min_qty - b.min_qty);
    const extra = sorted.find((r) => r.extra_per_unit != null);

    if (extra) {
      return `A partir do ${
        extra.min_qty
      }º item, cada item sai por apenas R$ ${Number(
        extra.extra_per_unit
      ).toFixed(2)}! Aproveite e leve mais!`;
    }
    // Se não houver adicional, pode mostrar o preço do primeiro item
    const first = sorted.find((r) => r.min_qty === 1 && r.price != null);
    if (first) {
      return `Unidade: R$ ${Number(first.price).toFixed(2)}`;
    }
    return "";
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 bg-white/80 rounded-full p-2 hover:bg-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative h-[30vh] sm:h-[40vh] md:h-[50vh] w-full bg-pink-50">
                <div className="absolute inset-0 p-4">
                  <Image
                    src={selectedOptions[0]?.image || product.image}
                    alt={product.name}
                    fill
                    className="object-contain rounded-3xl"
                    sizes="(max-width: 768px) 100vw, 80vw"
                    priority
                  />
                </div>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {product.name}
                </h2>
                <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg">
                  {product.description}
                </p>

                {product.product_options &&
                  product.product_options.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-base font-medium text-gray-700 mb-2">Escolha o tipo:</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {product.product_options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option)}
                            className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                              selectedOptions.some((o) => o.id === option.id)
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-200 hover:border-pink-200'
                            }`}
                          >
                            <span className="text-sm">{option.name}</span>
                            {option.price_delta > 0 && (
                              <span className="text-xs text-pink-600 font-medium">
                                +R$ {option.price_delta.toFixed(2)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="space-y-4">
                  {product.product_quantity_rules &&
                    product.product_quantity_rules.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {getPriceDescription(product.product_quantity_rules)}
                      </div>
                    )}

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.product_quantity_rules &&
                          product.product_quantity_rules.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-700">Items:</span>
                              <div className="ml-1 flex items-center gap-1 bg-white rounded-full p-1 shadow-sm">
                                <button
                                  onClick={() => handleQuantityChange(quantity - 1)}
                                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                                  disabled={quantity <= minQty}
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-sm font-medium">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(quantity + 1)}
                                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-700">Unid:</span>
                          <div className="ml-2 flex items-center gap-1 bg-white rounded-full p-1 shadow-sm">
                            <button
                              onClick={() => handleUnitQuantityChange(unitQuantity - 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                              disabled={unitQuantity <= 1}
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-sm font-medium">
                              {unitQuantity}
                            </span>
                            <button
                              onClick={() => handleUnitQuantityChange(unitQuantity + 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-pink-600 whitespace-nowrap">
                        R$ {calculateTotalPrice().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-pink-600 text-white py-3 sm:py-4 rounded-full hover:bg-pink-700 transition-colors duration-300 text-base sm:text-lg font-semibold mt-6"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailsModal;
