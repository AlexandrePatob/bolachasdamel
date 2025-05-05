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

  const calculateTotalPrice = () => {
    const optionsPrice = selectedOptions.reduce(
      (sum, option) => sum + option.price_delta,
      0
    );
    const validation = validateQuantity(quantity, product.product_quantity_rules);
    const basePrice = validation.price || product.price;

    if (optionsPrice > 0 && !validation.price) {
      return optionsPrice * quantity;
    }

    return validation.price 
      ? basePrice + (optionsPrice * quantity)
      : basePrice * quantity;
  };

  const calculateUnitPrice = () => {
    const optionsPrice = selectedOptions.reduce(
      (sum, option) => sum + option.price_delta,
      0
    );
    const validation = validateQuantity(
      quantity,
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

  const handleAddToCart = () => {
    const validation = validateQuantity(
      quantity,
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
      }º, cada unidade sai por apenas R$ ${Number(extra.extra_per_unit).toFixed(
        2
      )}! Aproveite e leve mais!`;
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

              <div className="relative h-[40vh] md:h-[50vh] w-full bg-pink-50">
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

              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  {product.description}
                </p>

                {product.product_options &&
                  product.product_options.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Opções</h3>
                      <div className="space-y-4">
                        {product.product_options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="radio"
                              id={option.id}
                              name="product-option"
                              checked={selectedOptions.some(
                                (o) => o.id === option.id
                              )}
                              onChange={() => handleOptionSelect(option)}
                              className="w-5 h-5 text-pink-600"
                            />
                            <label
                              htmlFor={option.id}
                              className="flex-1 flex items-center justify-between text-lg"
                            >
                              <span>{option.name}</span>
                              {option.price_delta > 0 && (
                                <span className="text-pink-600 font-semibold">
                                  +R$ {option.price_delta.toFixed(2)}
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col items-start gap-1">
                    {product.product_quantity_rules &&
                      product.product_quantity_rules.length > 0 && (
                        <div className="mb-1 text-xs text-gray-500 max-w-[200px] md:max-w-44">
                          {getPriceDescription(product.product_quantity_rules)}
                        </div>
                      )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xl hover:bg-pink-200 transition-colors"
                        disabled={quantity <= minQty}
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-xl font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xl hover:bg-pink-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-pink-600">
                    R$ {calculateTotalPrice().toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-pink-600 text-white py-4 rounded-full hover:bg-pink-700 transition-colors duration-300 text-lg font-semibold"
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
