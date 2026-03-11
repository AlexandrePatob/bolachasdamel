"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { ShoppingBag, ShoppingCart, X, Trash2, MapPin, Truck, ArrowLeft } from "lucide-react";
import { CartItem, clearCart, updateCartItemQuantity } from "@/lib/cart";
import { validateQuantity, getFixedPackSizes } from "@/lib/quantityRules";
import { ProductOption, ProductQuantityRule } from "@/types/database";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: (CartItem & {
    selected_options?: ProductOption[];
    product_quantity_rules?: ProductQuantityRule[];
    unit_quantity: number;
  })[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  isKitBuilder?: boolean;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  observations: string;
  delivery_date: string;
}

const QuantityButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-8 h-8 rounded-full border-2 border-pink-200 text-pink-600 flex items-center justify-center hover:border-pink-400 hover:bg-pink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 text-base font-medium"
  >
    {children}
  </button>
);

const CartModal = ({
  isOpen,
  onClose,
  items: initialItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isKitBuilder = false,
}: CartModalProps) => {
  const [step, setStep] = useState<"cart" | "form">("cart");
  const [items, setItems] = useState(initialItems);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    observations: "",
    delivery_date: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const calculateTotalPrice = (
    item: CartItem & { selected_options?: ProductOption[] }
  ) => {
    const optionsPrice =
      item.selected_options?.reduce(
        (sum: number, option: ProductOption) => sum + option.price_delta,
        0
      ) || 0;

    if (
      !item.product_quantity_rules ||
      item.product_quantity_rules.length === 0
    ) {
      return (item.price + optionsPrice) * item.quantity * item.unit_quantity;
    }

    const validation = validateQuantity(
      item.quantity,
      item.unit_quantity,
      item.product_quantity_rules
    );

    if (validation.price !== undefined) {
      return validation.price + optionsPrice * item.quantity;
    }

    return (item.price + optionsPrice) * item.unit_quantity;
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + calculateTotalPrice(item), 0);
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        observations: isKitBuilder
          ? "Kit montado:" + customerData.observations
          : customerData.observations,
        delivery_date: customerData.delivery_date,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_quantity: item.unit_quantity,
          unit_price: calculateTotalPrice(item) / item.quantity,
          has_chocolate: item.has_chocolate,
          selected_options: item.selected_options || [],
        })),
        total_amount: total,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      handleCartClear();

      setCustomerData({
        name: "",
        email: "",
        phone: "",
        observations: "",
        delivery_date: "",
      });

      setStep("cart");
      onClose();

      const formatCartItemForMessage = (
        item: (typeof items)[0]
      ) => {
        const opts =
          item.selected_options?.map((o) => o.name).join(", ") || "";
        const chocolate =
          item.has_chocolate_option
            ? ` (${item.has_chocolate ? "Com chocolate" : "Sem chocolate"})`
            : "";
        const qtyInfo =
          item.unit_quantity > 1
            ? ` - ${item.quantity}x de ${item.unit_quantity}un`
            : ` - ${item.quantity}x`;
        return `${item.name}${opts ? ` (${opts})` : ""}${chocolate}${qtyInfo} - R$ ${calculateTotalPrice(item).toFixed(2)}`;
      };

      const message =
        `Olá! Gostaria de fazer um pedido:%0A%0A` +
        `Nome: ${customerData.name}%0A` +
        `Email: ${customerData.email}%0A` +
        `Telefone: ${customerData.phone}%0A` +
        `Data de Entrega: ${new Date(
          customerData.delivery_date
        ).toLocaleDateString("pt-BR")}%0A` +
        (customerData.observations || isKitBuilder
          ? `Observações: ${
              isKitBuilder
                ? "Kit montado:" + customerData.observations
                : customerData.observations
            }%0A`
          : "") +
        `%0APedido:%0A` +
        items.map(formatCartItemForMessage).join("%0A") +
        `%0A%0ATotal: R$ ${total.toFixed(2)}`;

      const url = `https://wa.me/554198038007?text=${message}`;
      const win = window.open(url, "_blank", "noopener,noreferrer");

      if (!win || win.closed || typeof win.closed === "undefined") {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToForm = () => setStep("form");
  const handleBackToCart = () => setStep("cart");

  const handleChocolateChange = (itemId: string, hasChocolate: boolean) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, has_chocolate: hasChocolate } : item
    );
    setItems(updatedItems);
    const item = items.find((item) => item.id === itemId);
    if (item) updateCartItemQuantity(itemId, item.quantity, hasChocolate);
    toast.success(`${hasChocolate ? "Com" : "Sem"} chocolate`);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity <= 0) { handleItemRemove(id); return; }
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const validation = validateQuantity(quantity, item.unit_quantity, item.product_quantity_rules);
    if (!validation.isValid && validation.message) { toast.error(validation.message); return; }
    setItems((prevItems) =>
      prevItems.map((it) => (it.id === id ? { ...it, quantity } : it))
    );
    onUpdateQuantity(id, quantity);
    updateCartItemQuantity(id, quantity, undefined, item.unit_quantity);
  };

  const handleUnitQuantityChange = (id: string, unitQuantity: number) => {
    if (unitQuantity <= 0) { toast.error("Quantidade de unidades deve ser maior que zero"); return; }
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const validation = validateQuantity(item.quantity, unitQuantity, item.product_quantity_rules);
    if (!validation.isValid && validation.message) { toast.error(validation.message); return; }
    setItems((prevItems) =>
      prevItems.map((item) => item.id === id ? { ...item, unit_quantity: unitQuantity } : item)
    );
    updateCartItemQuantity(id, item.quantity, undefined, unitQuantity);
  };

  const handleItemRemove = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
    onRemoveItem(itemId);
  };

  const handleCartClear = () => {
    clearCart();
    onClearCart();
  };

  const cartContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {step === "form" ? (
            <button
              onClick={handleBackToCart}
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-150"
              aria-label="Voltar ao carrinho"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <ShoppingBag className="w-5 h-5 shrink-0 text-pink-600" />
          )}
          <h2 className="text-xl font-bold text-gray-800 truncate">
            {step === "cart" ? "Meu Carrinho" : "Seus Dados"}
          </h2>
          {step === "cart" && items.length > 0 && (
            <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body - área scrollável */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 sm:px-6 py-4" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {step === "cart" ? (
          <>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <ShoppingCart className="w-20 h-20 text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium text-lg mb-1">
                  Seu carrinho está vazio
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Adicione produtos para começar seu pedido
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-pink-600 text-white rounded-full text-sm font-medium hover:bg-pink-700 transition-colors"
                >
                  Ver Produtos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-pink-100 transition-colors"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm leading-tight">
                            {item.name}
                          </h3>
                          {item.selected_options &&
                            item.selected_options.length > 0 && (
                              <p className="text-xs text-pink-600 mt-0.5">
                                {item.selected_options
                                  .map((o) => o.name)
                                  .join(", ")}
                              </p>
                            )}
                        </div>
                        <button
                          onClick={() => handleItemRemove(item.id)}
                          className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-pink-600 font-bold text-base mt-0.5">
                        R$ {calculateTotalPrice(item).toFixed(2)}
                      </p>

                      {/* Chocolate option */}
                      {item.has_chocolate_option && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleChocolateChange(item.id, true)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                              item.has_chocolate
                                ? "bg-pink-100 text-pink-600 font-medium"
                                : "bg-gray-100 text-gray-500 hover:bg-pink-50"
                            }`}
                          >
                            Com chocolate
                          </button>
                          <button
                            onClick={() => handleChocolateChange(item.id, false)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors ${
                              !item.has_chocolate
                                ? "bg-pink-100 text-pink-600 font-medium"
                                : "bg-gray-100 text-gray-500 hover:bg-pink-50"
                            }`}
                          >
                            Sem chocolate
                          </button>
                        </div>
                      )}

                      {/* Quantity controls */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        {item.product_quantity_rules &&
                          item.product_quantity_rules.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-14">
                                {getFixedPackSizes(item.product_quantity_rules).length > 0
                                  ? "Pacotes:"
                                  : "Itens:"}
                              </span>
                              <QuantityButton
                                onClick={() => handleQuantityChange(item.id, Math.max(0, item.quantity - 1))}
                                disabled={(() => {
                                  const v = validateQuantity(item.quantity - 1, item.unit_quantity, item.product_quantity_rules);
                                  return !v.isValid;
                                })()}
                              >
                                −
                              </QuantityButton>
                              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                              <QuantityButton
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={
                                  !validateQuantity(
                                    item.quantity + 1,
                                    item.unit_quantity,
                                    item.product_quantity_rules
                                  ).isValid
                                }
                              >
                                +
                              </QuantityButton>
                            </div>
                          )}
                        {getFixedPackSizes(item.product_quantity_rules ?? []).length > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-14">Pacote:</span>
                            <span className="text-sm font-medium">{item.unit_quantity} un</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-14">Unidades:</span>
                            <QuantityButton
                              onClick={() => handleUnitQuantityChange(item.id, Math.max(1, item.unit_quantity - 1))}
                              disabled={(() => {
                                const v = validateQuantity(item.quantity, item.unit_quantity - 1, item.product_quantity_rules);
                                return !v.isValid;
                              })()}
                            >
                              −
                            </QuantityButton>
                            <span className="w-6 text-center text-sm font-medium">{item.unit_quantity}</span>
                            <QuantityButton
                              onClick={() => handleUnitQuantityChange(item.id, item.unit_quantity + 1)}
                              disabled={
                                !validateQuantity(
                                  item.quantity,
                                  item.unit_quantity + 1,
                                  item.product_quantity_rules
                                ).isValid
                              }
                            >
                              +
                            </QuantityButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form id="order-form" onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
              <input type="text" id="name" required value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-base sm:text-sm"
                placeholder="Seu nome completo" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" id="email" required value={customerData.email}
                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-base sm:text-sm"
                placeholder="seu@email.com" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
              <input type="tel" id="phone" required value={customerData.phone}
                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-base sm:text-sm"
                placeholder="(41) 99999-9999"
                inputMode="numeric" />
            </div>
            <div>
              <label htmlFor="observations" className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
              <textarea id="observations" value={customerData.observations}
                onChange={(e) => setCustomerData({ ...customerData, observations: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-base sm:text-sm resize-none"
                placeholder="Alguma observação especial?" rows={3} />
            </div>
            <div>
              <label htmlFor="delivery_date" className="block text-sm font-semibold text-gray-700 mb-1">Data de Entrega</label>
              <input type="date" id="delivery_date" required
                min={(() => {
                  const today = new Date();
                  let daysToAdd = 2;
                  let minDate = new Date(today);
                  while (daysToAdd > 0) {
                    minDate.setDate(minDate.getDate() + 1);
                    if (minDate.getDay() !== 0 && minDate.getDay() !== 6) daysToAdd--;
                  }
                  return minDate.toISOString().split("T")[0];
                })()}
                value={customerData.delivery_date}
                onChange={(e) => setCustomerData({ ...customerData, delivery_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-base sm:text-sm" />
              <p className="text-gray-400 text-xs mt-1">Prazo mínimo de 2 dias úteis para produção</p>
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-4 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white shrink-0">
          {step === "cart" ? (
            <>
              {/* Delivery info */}
              <div className="mb-3 sm:mb-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-rose-700 text-xs font-medium mb-2">
                  Entrega e pagamento combinados via WhatsApp
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    Retirada em Santa Felicidade
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Truck className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    Entrega via Uber (combinar)
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="text-2xl font-bold text-pink-600">
                  R$ {total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleProceedToForm}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3.5 rounded-full font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Finalizar Pedido
              </button>
              <button
                onClick={onClose}
                className="w-full mt-2 text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
              >
                Continuar comprando
              </button>
            </>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleBackToCart}
                className="w-full sm:flex-1 bg-gray-100 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Voltar
              </button>
              <button
                type="submit"
                form="order-form"
                disabled={loading}
                className="w-full sm:flex-1 bg-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  "Enviar Pedido"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Mobile: bottom drawer - altura fixa para scroll funcionar */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl h-[90dvh] flex flex-col min-h-0 md:hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {cartContent}
            </div>
          </motion.div>

          {/* Desktop: centered modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col min-h-0 overflow-hidden"
              style={{ pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              {cartContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
