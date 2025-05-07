import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/database";
import Image from "next/image";
import toast from "react-hot-toast";
import { validateQuantity } from "@/lib/quantityRules";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  has_chocolate: boolean;
  unit_quantity: number;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: CreateOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    number: "",
    complement: "",
    observations: "",
    delivery_date: "",
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error("Selecione um produto");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    setItems([
      ...items,
      {
        product_id: product.id,
        quantity: 1,
        unit_price: product.price,
        has_chocolate: false,
        unit_quantity: 1,
      },
    ]);

    setSelectedProduct("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const item = items[index];
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return;

    const validation = validateQuantity(
      newQuantity,
      item.unit_quantity,
      product.product_quantity_rules || []
    );
    if (!validation.isValid && validation.message) {
      toast.error(validation.message);
      return;
    }

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity: newQuantity,
      unit_price: validation.price || product.price,
    };
    setItems(newItems);
  };

  const handleUnitQuantityChange = (index: number, newUnitQuantity: number) => {
    const item = items[index];
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return;

    const validation = validateQuantity(
      item.quantity,
      newUnitQuantity,
      product.product_quantity_rules || []
    );
    if (!validation.isValid && validation.message) {
      toast.error(validation.message);
      return;
    }

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      unit_quantity: newUnitQuantity,
      unit_price: validation.price || product.price,
    };
    setItems(newItems);
  };

  const handleChocolateChange = (index: number, hasChocolate: boolean) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      has_chocolate: hasChocolate,
    };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item ao pedido");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone,
          customer_address: customer.address,
          complement: customer.complement,
          observations: customer.observations,
          delivery_date: customer.delivery_date,
          items: items.map((item) => {
            const product = products.find((p) => p.id === item.product_id);
            if (!product) return item;

            const validation = validateQuantity(
              item.quantity,
              item.unit_quantity,
              product.product_quantity_rules || []
            );
            return {
              ...item,
              unit_price: validation.price || product.price,
            };
          }),
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      toast.success("Pedido criado com sucesso!");
      onOrderCreated();
      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Erro ao criar pedido");
    }
  };

  const totalAmount = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return sum;

    const validation = validateQuantity(
      item.quantity,
      item.unit_quantity,
      product.product_quantity_rules || []
    );
    const unitPrice = validation.price || product.price;
    return sum + item.quantity * unitPrice;
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="px-6 py-4 border-b border-pink-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#6b4c3b]">
                    Criar Novo Pedido
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h3 className="text-lg font-medium text-[#6b4c3b] mb-3">
                    Informações do Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.name}
                        onChange={(e) =>
                          setCustomer({ ...customer, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={customer.email}
                        onChange={(e) =>
                          setCustomer({ ...customer, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        required
                        value={customer.phone}
                        onChange={(e) =>
                          setCustomer({ ...customer, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                        Endereço
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.address}
                        onChange={(e) =>
                          setCustomer({ ...customer, address: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.number}
                        onChange={(e) =>
                          setCustomer({ ...customer, number: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={customer.complement}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            complement: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                        Observações
                      </label>
                      <textarea
                        value={customer.observations}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            observations: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                        Data de Entrega
                      </label>
                      <input
                        type="date"
                        required
                        min={(() => {
                          const today = new Date();
                          let daysToAdd = 2;
                          let minDate = new Date(today);

                          while (daysToAdd > 0) {
                            minDate.setDate(minDate.getDate() + 1);
                            if (
                              minDate.getDay() !== 0 &&
                              minDate.getDay() !== 6
                            ) {
                              daysToAdd--;
                            }
                          }

                          return minDate.toISOString().split("T")[0];
                        })()}
                        value={customer.delivery_date}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            delivery_date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Prazo mínimo de 2 dias úteis para produção
                      </p>
                    </div>
                  </div>
                </div>

                {/* Adicionar Item */}
                <div>
                  <h3 className="text-lg font-medium text-[#6b4c3b] mb-3">
                    Adicionar Item
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                          Produto
                        </label>
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        >
                          <option value="">Selecione um produto</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - R$ {product.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value);
                            if (newQuantity < 1) {
                              toast.error("Quantidade mínima é 1 unidade");
                              return;
                            }
                            const product = products.find(
                              (p) => p.id === selectedProduct
                            );
                            if (product) {
                              const validation = validateQuantity(
                                newQuantity,
                                1, // Default unit quantity for new items
                                product.product_quantity_rules || []
                              );
                              if (!validation.isValid && validation.message) {
                                toast.error(validation.message);
                                return;
                              }
                            }
                            setQuantity(newQuantity);
                          }}
                          className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                      </div>
                    </div>

                    {/* Opção de Chocolate */}
                    {selectedProduct && (
                      <div className="flex items-center space-x-2">
                        {products.find((p) => p.id === selectedProduct)
                          ?.has_chocolate_option && (
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                items[items.length - 1]?.has_chocolate || false
                              }
                              onChange={(e) => {
                                const product = products.find(
                                  (p) => p.id === selectedProduct
                                );
                                if (!product) return;

                                const newItem = {
                                  product_id: selectedProduct,
                                  quantity,
                                  unit_price: product.price,
                                  has_chocolate: e.target.checked,
                                  unit_quantity: product.unit_quantity,
                                };

                                setItems([...items.slice(0, -1), newItem]);
                              }}
                              className="form-checkbox h-4 w-4 text-[#6b4c3b] border-pink-200 rounded focus:ring-[#6b4c3b]"
                            />
                            <span className="ml-2 text-sm text-[#6b4c3b]">
                              Com chocolate
                            </span>
                          </label>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-[#6b4c3b] text-white rounded-lg hover:bg-[#5a3d2e] focus:outline-none focus:ring-2 focus:ring-[#6b4c3b] focus:ring-offset-2"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de Itens */}
                <div>
                  <h3 className="text-lg font-medium text-[#6b4c3b] mb-3">
                    Itens do Pedido
                  </h3>
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const product = products.find(
                        (p) => p.id === item.product_id
                      );
                      if (!product) return null;

                      const validation = validateQuantity(
                        item.quantity,
                        item.unit_quantity,
                        product.product_quantity_rules || []
                      );
                      const unitPrice = validation.price || product.price;
                      const totalPrice = item.quantity * unitPrice;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4"
                        >
                          <div className="flex items-center space-x-4">
                            {product.image && (
                              <div className="relative w-16 h-16">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-[#6b4c3b]">
                                {product.name}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">Itens:</span>
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        index,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                  >
                                    -
                                  </button>
                                  <span className="text-sm text-[#6b4c3b]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        index,
                                        item.quantity + 1
                                      )
                                    }
                                    className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <span className="text-sm text-gray-600">Unidades:</span>
                                  <button
                                    onClick={() =>
                                      handleUnitQuantityChange(
                                        index,
                                        Math.max(1, item.unit_quantity - 1)
                                      )
                                    }
                                    className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                  >
                                    -
                                  </button>
                                  <span className="text-sm text-[#6b4c3b]">
                                    {item.unit_quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleUnitQuantityChange(
                                        index,
                                        item.unit_quantity + 1
                                      )
                                    }
                                    className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-[#6b4c3b]">
                                Preço unitário: R$ {unitPrice.toFixed(2)}
                              </p>
                              <p className="text-sm font-medium text-[#6b4c3b]">
                                Total: R$ {totalPrice.toFixed(2)}
                              </p>
                              {product.has_chocolate_option && (
                                <div className="mt-2">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={item.has_chocolate}
                                      onChange={(e) =>
                                        handleChocolateChange(
                                          index,
                                          e.target.checked
                                        )
                                      }
                                      className="form-checkbox h-4 w-4 text-[#6b4c3b] border-pink-200 rounded focus:ring-[#6b4c3b]"
                                    />
                                    <span className="ml-2 text-sm text-[#6b4c3b]">
                                      Com chocolate
                                    </span>
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remover
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total e Botões */}
                <div className="flex items-center justify-between pt-4 border-t border-pink-100">
                  <div className="text-lg font-semibold text-[#6b4c3b]">
                    Total: R$ {totalAmount.toFixed(2)}
                  </div>
                  <div className="space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-[#6b4c3b] border border-[#6b4c3b] rounded-lg hover:bg-[#6b4c3b] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6b4c3b] focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#6b4c3b] text-white rounded-lg hover:bg-[#5a3d2e] focus:outline-none focus:ring-2 focus:ring-[#6b4c3b] focus:ring-offset-2"
                    >
                      Criar Pedido
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
