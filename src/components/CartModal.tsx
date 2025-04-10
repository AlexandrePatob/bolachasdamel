"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { CartItem, clearCart, updateCartItemQuantity } from "@/lib/cart";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  number: string;
  complement: string;
  observations: string;
  delivery_date: string;
}

const CartModal = ({
  isOpen,
  onClose,
  items: initialItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartModalProps) => {
  const [step, setStep] = useState<"cart" | "form">("cart");
  const [items, setItems] = useState(initialItems);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    number: "",
    complement: "",
    observations: "",
    delivery_date: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_address: `${customerData.address}, ${customerData.number}`,
        complement: customerData.complement,
        observations: customerData.observations,
        delivery_date: customerData.delivery_date,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          has_chocolate: item.has_chocolate,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao criar pedido");
      }
      toast.success("Pedido criado com sucesso!", {
        duration: 5000,
        position: "top-center",
      });

      // Limpa o carrinho após sucesso
      handleCartClear();

      // Limpa os dados do cliente
      setCustomerData({
        name: "",
        email: "",
        phone: "",
        address: "",
        number: "",
        complement: "",
        observations: "",
        delivery_date: "",
      });

      // Volta para o step do carrinho
      setStep("cart");

      // Fecha o modal
      onClose();

      // Abre o WhatsApp
      const message =
        `Olá! Gostaria de fazer um pedido:%0A%0A` +
        `Nome: ${customerData.name}%0A` +
        `Email: ${customerData.email}%0A` +
        `Telefone: ${customerData.phone}%0A` +
        `Endereço: ${customerData.address}, ${customerData.number}${
          customerData.complement ? ` - ${customerData.complement}` : ""
        }%0A` +
        `Data de Entrega: ${new Date(customerData.delivery_date).toLocaleDateString('pt-BR')}%0A` +
        (customerData.observations
          ? `Observações: ${customerData.observations}%0A`
          : "") +
        `%0APedido:%0A` +
        items
          .map(
            (item) =>
              `${item.name}${
                item.has_chocolate_option
                  ? ` (${
                      item.has_chocolate ? "Com chocolate" : "Sem chocolate"
                    })`
                  : ""
              } - ${item.quantity}x - R$ ${(item.price * item.quantity).toFixed(
                2
              )}`
          )
          .join("%0A") +
        `%0A%0ATotal: R$ ${total.toFixed(2)}`;

      // Cria um link temporário e clica nele programaticamente
      const link = document.createElement("a");
      link.href = `https://wa.me/554198038007?text=${message}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar pedido. Tente novamente.");
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

  const handleChocolateChange = (itemId: string, hasChocolate: boolean) => {
    // Atualiza o estado local
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, has_chocolate: hasChocolate } : item
    );
    setItems(updatedItems);

    // Atualiza o carrinho global
    const item = items.find((item) => item.id === itemId);
    if (item) {
      updateCartItemQuantity(itemId, item.quantity, hasChocolate);
    }

    // Notifica o usuário
    toast.success(`${hasChocolate ? "Com" : "Sem"} chocolate`);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setItems(updatedItems);
    onUpdateQuantity(itemId, newQuantity);
  };

  const handleItemRemove = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
    onRemoveItem(itemId);
  };

  const handleCartClear = () => {
    clearCart();
    onClearCart();
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
                  className="text-gray-500 hover:text-gray-700 text-2xl font-light"
                >
                  ×
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
                              {item.has_chocolate_option && (
                                <div className="mt-2 flex items-center space-x-4">
                                  <button
                                    onClick={() =>
                                      handleChocolateChange(item.id, true)
                                    }
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${
                                      item.has_chocolate
                                        ? "bg-pink-100 text-pink-600"
                                        : "bg-gray-100 text-gray-600 hover:bg-pink-50"
                                    }`}
                                  >
                                    <span>🍫</span>
                                    <span className="text-sm">
                                      Com chocolate
                                    </span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleChocolateChange(item.id, false)
                                    }
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${
                                      !item.has_chocolate
                                        ? "bg-pink-100 text-pink-600"
                                        : "bg-gray-100 text-gray-600 hover:bg-pink-50"
                                    }`}
                                  >
                                    <span>🍪</span>
                                    <span className="text-sm">
                                      Sem chocolate
                                    </span>
                                  </button>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
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
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => handleItemRemove(item.id)}
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
                          <h3 className="text-lg font-semibold text-pink-600 mb-2">Entrega e Pagamento</h3>
                          <p className="text-pink-700 text-sm mb-3">
                            O valor do frete e a forma de pagamento serão combinados via WhatsApp após a confirmação do pedido.
                          </p>
                          <div className="space-y-2">
                            <div className="p-3 bg-white rounded-lg border border-pink-100 flex items-center">
                              <span className="text-pink-600 mr-2">📍</span>
                              <span className="text-gray-700">Retirada em Santa Felicidade</span>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-pink-100 flex items-center">
                              <span className="text-pink-600 mr-2">🚗</span>
                              <span className="text-gray-700">Combinar via WhatsApp (Uber entrega)</span>
                            </div>
                          </div>
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
                <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div>
                    <label
                      htmlFor="complement"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Complemento
                    </label>
                    <input
                      type="text"
                      id="complement"
                      value={customerData.complement}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          complement: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Apto 123, Bloco B, etc."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="observations"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Observações
                    </label>
                    <textarea
                      id="observations"
                      value={customerData.observations}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          observations: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Alguma observação especial para seu pedido?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="delivery_date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Data de Entrega
                    </label>
                    <input
                      type="date"
                      id="delivery_date"
                      required
                      min={(() => {
                        const today = new Date();
                        let daysToAdd = 2;
                        let minDate = new Date(today);
                        
                        while (daysToAdd > 0) {
                          minDate.setDate(minDate.getDate() + 1);
                          if (minDate.getDay() !== 0 && minDate.getDay() !== 6) {
                            daysToAdd--;
                          }
                        }
                        
                        return minDate.toISOString().split('T')[0];
                      })()}
                      value={customerData.delivery_date}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          delivery_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Prazo mínimo de 2 dias úteis para produção
                    </p>
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
                      className="flex-1 bg-green-500 text-white py-3 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500"
                    >
                      {loading ? (
                        <motion.div
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            Enviando...
                          </motion.span>
                        </motion.div>
                      ) : (
                        <>
                          <span>Enviar Pedido</span>
                          <span>💬</span>
                        </>
                      )}
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
