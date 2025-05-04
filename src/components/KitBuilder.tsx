import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem } from "@/types/cart";
import ProductList from "./ProductList";

interface KitBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (items: CartItem[]) => void;
}

const KitBuilder: React.FC<KitBuilderProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleItemSelect = (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    has_chocolate_option: boolean;
    has_chocolate: boolean;
    quantity?: number;
  }) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        ...product,
        quantity: 1,
        product_id: product.id,
        has_chocolate_option: product.has_chocolate_option,
        has_chocolate: product.has_chocolate,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(selectedItems);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-pink-600">
              Monte seu Kit Especial
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Progresso</span>
              <span className="text-sm text-gray-600">
                Passo {currentStep} de {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold mb-4">
            {currentStep === 1 && "Escolha os produtos para seu kit"}
            {currentStep === 2 && "Revise sua seleção"}
            {currentStep === 3 && "Confirme seu kit"}
          </h3>

          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h4 className="text-md font-medium mb-4 text-pink-600">Produtos para Kit</h4>
                <ProductList
                  category="maes-kit"
                  onOrderClick={handleItemSelect}
                  showTitle={false}
                  isKitBuilder={true}
                />
              </div>
              <div>
                <ProductList
                  showTitle={false}
                  category="maes"
                  onOrderClick={handleItemSelect}
                  isKitBuilder={true}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        R$ {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-700 mb-2">
                  Resumo do seu Kit
                </h4>
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-pink-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>
                        R${" "}
                        {selectedItems
                          .reduce(
                            (acc, item) => acc + item.price * item.quantity,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Ao confirmar, seu kit será adicionado ao carrinho. Você pode
                continuar comprando ou finalizar seu pedido.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-white">
          <div className="flex justify-between">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className={`px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 ml-auto ${
                selectedItems.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={selectedItems.length === 0}
            >
              {currentStep === totalSteps ? "Confirmar Kit" : "Próximo"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KitBuilder;
