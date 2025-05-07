import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem } from "@/types/cart";
import ProductList from "./ProductList";
import { validateQuantity } from "@/lib/quantityRules";
import { toast } from "react-hot-toast";
import { Product } from "@/types/database";

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

  const calculateTotalPrice = (item: CartItem) => {
    const optionsPrice = 0; // Kit builder não tem opções por enquanto

    // Se não tiver regras de quantidade, usa o preço unitário
    if (
      !item.product_quantity_rules ||
      item.product_quantity_rules.length === 0
    ) {
      return (item.price + optionsPrice) * item.unit_quantity;
    }

    // Se tiver regras, valida a quantidade
    const validation = validateQuantity(
      item.quantity,
      item.unit_quantity,
      item.product_quantity_rules
    );

    // Se a validação retornar um preço, usa ele
    if (validation.price !== undefined) {
      return validation.price + optionsPrice * item.quantity;
    }

    // Se não retornar preço, usa o preço unitário
    return (item.price + optionsPrice) * item.unit_quantity;
  };

  const getMinQty = (rules?: Product["product_quantity_rules"]) => {
    if (!rules || rules.length === 0) return 1;
    return Math.min(...rules.map((r) => r.min_qty));
  };

  const handleItemSelect = (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    has_chocolate_option: boolean;
    has_chocolate: boolean;
    product_quantity_rules?: any[];
    unit_quantity: number;
  }) => {
    // Define quantidade inicial baseada nas regras
    let initialQuantity = 1;
    let initialUnitQuantity = product.unit_quantity || 1;

    if (
      product.product_quantity_rules &&
      product.product_quantity_rules.length > 0
    ) {
      // Procura a primeira regra com quantidade mínima
      const minQty = getMinQty(product.product_quantity_rules);
      if (minQty) {
        initialQuantity = minQty;
      }

      // Valida a quantidade inicial
      const validation = validateQuantity(
        initialQuantity,
        initialUnitQuantity,
        product.product_quantity_rules
      );

      // Se não for válida, mostra mensagem de erro
      if (!validation.isValid && validation.message) {
        toast.error(validation.message);
        return;
      }
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        ...product,
        quantity: initialQuantity,
        unit_quantity: initialUnitQuantity,
        product_id: product.id,
        has_chocolate_option: product.has_chocolate_option,
        has_chocolate: product.has_chocolate,
        product_quantity_rules: product.product_quantity_rules,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    const item = selectedItems.find((i) => i.id === id);
    if (!item) return;

    const validation = validateQuantity(
      quantity,
      item.unit_quantity,
      item.product_quantity_rules
    );
    if (!validation.isValid && validation.message) {
      toast.error(validation.message);
      return;
    }

    setSelectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleUnitQuantityChange = (id: string, unitQuantity: number) => {
    if (unitQuantity <= 0) {
      toast.error("Quantidade de unidades deve ser maior que zero");
      return;
    }
    const item = selectedItems.find((i) => i.id === id);
    if (!item) return;

    const validation = validateQuantity(
      item.quantity,
      unitQuantity,
      item.product_quantity_rules
    );
    if (!validation.isValid && validation.message) {
      toast.error(validation.message);
      return;
    }

    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unit_quantity: unitQuantity } : item
      )
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

  const resetState = () => {
    setSelectedItems([]);
    setCurrentStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        <div className="p-4 sm:p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-pink-600">
              Monte seu Kit Especial
            </h2>
            <button
              onClick={() => {
                resetState();
                onClose();
              }}
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">
            {currentStep === 1 && "Escolha os produtos para seu kit"}
            {currentStep === 2 && "Revise sua seleção"}
            {currentStep === 3 && "Confirme seu kit"}
          </h3>

          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h4 className="text-md font-medium mb-4 text-pink-600">
                  Produtos para Kit
                </h4>
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-4 sm:space-y-0"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.product_quantity_rules &&
                        item.product_quantity_rules.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            {item.quantity} {item.quantity > 1 ? 'itens' : 'item'}
                          </span>
                        )}
                        {item.unit_quantity > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            {item.unit_quantity} {item.unit_quantity > 1 ? 'unidades' : 'unidade'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex flex-col space-y-3">
                      {item.product_quantity_rules &&
                        item.product_quantity_rules.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">
                              Itens:
                            </span>
                            <div className="flex items-center space-x-2 rounded-full p-1">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity - 1)
                                }
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity + 1)
                                }
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                          Unidades:
                        </span>
                        <div className="flex items-center space-x-2 bg-white rounded-full p-1 shadow-sm">
                          <button
                            onClick={() =>
                              handleUnitQuantityChange(
                                item.id,
                                item.unit_quantity - 1
                              )
                            }
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.unit_quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUnitQuantityChange(
                                item.id,
                                item.unit_quantity + 1
                              )
                            }
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="font-medium text-pink-700 text-lg">
                        R$ {calculateTotalPrice(item).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-700 mb-4 text-lg">
                  Resumo do seu Kit
                </h4>
                <div className="space-y-4">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row justify-between border-b border-pink-100 pb-3 last:border-0">
                      <div className="flex items-start space-x-3 mb-2 sm:mb-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="space-y-1">
                          <span className="font-medium block">{item.name}</span>
                          <div className="flex flex-wrap gap-2">
                            {item.product_quantity_rules &&
                            item.product_quantity_rules.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                {item.quantity} {item.quantity > 1 ? 'itens' : 'item'}
                              </span>
                            )}
                            {item.unit_quantity > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                {item.unit_quantity} {item.unit_quantity > 1 ? 'unidades' : 'unidade'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-pink-700 text-lg">
                          R$ {calculateTotalPrice(item).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-pink-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total do Kit</span>
                      <span className="font-bold text-lg text-pink-700">
                        R${" "}
                        {selectedItems
                          .reduce(
                            (acc, item) => acc + calculateTotalPrice(item),
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Ao confirmar, seu kit será adicionado ao carrinho. Você pode
                  continuar comprando ou finalizar seu pedido.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t bg-white">
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 w-full sm:w-auto"
              >
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className={`px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 w-full sm:w-auto ${
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
