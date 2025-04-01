"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { CartItem } from "@/types/cart";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  number: string;
}

const CartModal = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartModalProps) => {
  const [step, setStep] = useState<"cart" | "form">("cart");
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    number: "",
  });
  const [loading, setLoading] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCustomerDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: customerData,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pedido');
      }

      const data = await response.json();
      
      // Limpa o carrinho após sucesso
      onClearCart();
      
      // Fecha o modal
      onClose();
      
      // Abre o WhatsApp
      const message =
        `Olá! Gostaria de fazer um pedido:%0A%0A` +
        `Nome: ${customerData.name}%0A` +
        `Email: ${customerData.email}%0A` +
        `Telefone: ${customerData.phone}%0A` +
        `Endereço: ${customerData.address}, ${customerData.number}%0A%0A` +
        `Pedido:%0A` +
        items
          .map(
            (item) =>
              `${item.name} - ${item.quantity}x - R$ ${(
                item.price * item.quantity
              ).toFixed(2)}`
          )
          .join("%0A") +
        `%0A%0ATotal: R$ ${total.toFixed(2)}`;

      window.open(`https://wa.me/554198038007?text=${message}`, "_blank");
      
      toast.success('Pedido enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToForm = () => {
    setStep("form");
  };

  const handleBackToCart = () => {
    setStep("cart");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-pink-600">
                  {step === "cart" ? "Seu Pedido" : "Seus Dados"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {step === "cart" ? (
                <>
                  {items.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Seu carrinho está vazio
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-4"
                          >
                            <div className="relative w-20 h-20 rounded-full overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-pink-600">
                                {item.name}
                              </h3>
                              <p className="text-gray-600">
                                R$ {item.price.toFixed(2)}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(
                                      item.id,
                                      Math.max(0, item.quantity - 1)
                                    )
                                  }
                                  className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => onRemoveItem(item.id)}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">Total:</span>
                          <span className="text-xl font-bold text-pink-600">
                            R$ {total.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="mb-4 p-4 bg-pink-50 rounded-lg border border-pink-100">
                          <p className="text-pink-700 text-sm">
                            ℹ️ O valor do frete e a forma de pagamento serão combinados via WhatsApp após a confirmação do pedido.
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={handleProceedToForm}
                            className="w-full bg-pink-600 text-white py-3 rounded-full hover:bg-pink-700 transition-colors duration-300"
                          >
                            Finalizar pedido
                          </button>
                          <button
                            onClick={onClose}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-full hover:bg-gray-200 transition-colors duration-300"
                          >
                            Continuar comprando
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <form onSubmit={handleCustomerDataSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={customerData.name}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={customerData.phone}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder="(41) 99999-9999"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Endereço
                      </label>
                      <input
                        type="text"
                        id="address"
                        required
                        value={customerData.address}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Rua, Bairro"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="number"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Número
                      </label>
                      <input
                        type="text"
                        id="number"
                        required
                        value={customerData.number}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            number: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleBackToCart}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-full hover:bg-gray-200 transition-colors duration-300"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-500 text-white py-3 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{loading ? 'Enviando...' : 'Enviar Pedido'}</span>
                      <span>💬</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
