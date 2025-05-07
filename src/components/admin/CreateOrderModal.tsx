import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, ProductOption } from "@/types/database";
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
  selected_options?: ProductOption[];
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
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [unitQuantity, setUnitQuantity] = useState(1);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [quickUnitQuantity, setQuickUnitQuantity] = useState(1);
  const [quickSelectedOptions, setQuickSelectedOptions] = useState<ProductOption[]>([]);

  const getMinQty = (rules?: Product["product_quantity_rules"]) => {
    if (!rules || rules.length === 0) return 1;
    return Math.min(...rules.map((r) => r.min_qty));
  };

  const calculateTotalPrice = (item: OrderItem) => {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) return 0;

    const optionsPrice = item.selected_options?.reduce(
      (sum, option) => sum + option.price_delta,
      0
    ) || 0;

    const validation = validateQuantity(
      item.quantity,
      item.unit_quantity,
      product.product_quantity_rules || []
    );
    const basePrice = validation.price || product.price;

    if (optionsPrice > 0 && !validation.price) {
      return optionsPrice * item.unit_quantity;
    }

    return validation.price
      ? basePrice + optionsPrice * item.unit_quantity
      : basePrice * item.unit_quantity;
  };

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

    const validation = validateQuantity(
      quantity,
      unitQuantity,
      product.product_quantity_rules || []
    );
    if (!validation.isValid && validation.message) {
      toast.error(validation.message);
      return;
    }

    setItems([
      ...items,
      {
        product_id: product.id,
        quantity: quantity,
        unit_price: validation.price || product.price,
        has_chocolate: false,
        unit_quantity: unitQuantity,
        selected_options: [],
      },
    ]);

    setSelectedProduct("");
    setQuantity(1);
    setUnitQuantity(1);
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
          total_amount: totalAmount,
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

  const totalAmount = items.reduce((sum, item) => sum + calculateTotalPrice(item), 0);

  const handleQuickAdd = () => {
    if (!quickAddProduct) return;

    const validation = validateQuantity(
      quickQuantity,
      quickUnitQuantity,
      quickAddProduct.product_quantity_rules || []
    );
    if (!validation.isValid && validation.message) {
      toast.error(validation.message);
      return;
    }

    const optionsPrice = quickSelectedOptions.reduce(
      (sum, option) => sum + option.price_delta,
      0
    );

    setItems([
      ...items,
      {
        product_id: quickAddProduct.id,
        quantity: quickQuantity,
        unit_price: validation.price || quickAddProduct.price + optionsPrice,
        has_chocolate: false,
        unit_quantity: quickUnitQuantity,
        selected_options: quickSelectedOptions,
      },
    ]);

    setQuickAddProduct(null);
    setQuickQuantity(1);
    setQuickUnitQuantity(1);
    setQuickSelectedOptions([]);
  };

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
            <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="px-8 py-6 border-b border-pink-100">
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
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Informações do Cliente */}
                <div>
                  <h3 className="text-xl font-medium text-[#6b4c3b] mb-4">
                    Informações do Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </div>

                    <div className="md:col-span-2">
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

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                          Prazo mínimo de 2 dias úteis
                        </p>
                      </div>
                      <div>
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
                          rows={2}
                          className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adicionar Item */}
                <div>
                  <h3 className="text-xl font-medium text-[#6b4c3b] mb-4">
                    Adicionar Item
                  </h3>
                  <div className="bg-white rounded-lg p-6 border border-pink-100">
                    <div className="space-y-6">
                      {!selectedProduct ? (
                  <div className="space-y-4">
                          {Array.from(new Set(products.map(p => p.category))).map(category => (
                            <div key={category} className="border border-pink-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => {
                                  const categoryElement = document.getElementById(`category-${category}`);
                                  if (categoryElement) {
                                    const isExpanded = categoryElement.getAttribute('aria-expanded') === 'true';
                                    categoryElement.setAttribute('aria-expanded', (!isExpanded).toString());
                                    categoryElement.style.maxHeight = isExpanded ? '0px' : `${categoryElement.scrollHeight}px`;
                                  }
                                }}
                                className="w-full px-4 py-3 flex items-center justify-between bg-pink-50 hover:bg-pink-100 transition-colors"
                              >
                                <h4 className="text-lg font-medium text-[#6b4c3b] capitalize">
                                  {category}
                                </h4>
                                <svg
                                  className="w-5 h-5 text-[#6b4c3b] transform transition-transform"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                              <div
                                id={`category-${category}`}
                                aria-expanded="false"
                                className="max-h-0 overflow-hidden transition-all duration-300 ease-in-out"
                                style={{ maxHeight: '0px' }}
                              >
                                <div className="p-4">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {products
                                      .filter(p => p.category === category)
                                      .map((product) => (
                                        <button
                                          key={product.id}
                                          onClick={() => {
                                            setQuickAddProduct(product);
                                            const minQty = getMinQty(product.product_quantity_rules);
                                            setQuickQuantity(minQty);
                                            setQuickUnitQuantity(1);
                                          }}
                                          className="flex flex-col p-3 border border-pink-100 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-left h-full"
                                        >
                                          <div className="relative w-full aspect-square mb-2">
                                            <Image
                                              src={product.image}
                                              alt={product.name}
                                              fill
                                              className="object-cover rounded-lg"
                                            />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-[#6b4c3b] text-sm truncate">
                                              {product.name}
                                            </h4>
                                            <div className="mt-1">
                                              <p className="text-sm font-medium text-[#6b4c3b]">
                                                R$ {product.price.toFixed(2)}
                                              </p>
                                              {product.product_quantity_rules && product.product_quantity_rules.length > 0 && (
                                                <div className="text-xs text-pink-600 mt-1">
                                                  {(() => {
                                                    const minQty = getMinQty(product.product_quantity_rules);
                                                    const extra = product.product_quantity_rules.find(r => r.extra_per_unit != null);
                                                    if (extra) {
                                                      return `+${extra.min_qty} itens: R$ ${Number(extra.extra_per_unit).toFixed(2)}`;
                                                    }
                                                    return `Mín: ${minQty}`;
                                                  })()}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Quick Add Modal */}
                {quickAddProduct && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16">
                            <Image
                              src={quickSelectedOptions[0]?.image || quickAddProduct.image}
                              alt={quickAddProduct.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-[#6b4c3b]">
                              {quickAddProduct.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Preço base: R$ {quickAddProduct.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setQuickAddProduct(null);
                            setQuickSelectedOptions([]);
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Opções do Produto */}
                        {quickAddProduct.product_options && quickAddProduct.product_options.length > 0 && (
                          <div className="bg-pink-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-[#6b4c3b] mb-2">Escolha o tipo:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {quickAddProduct.product_options.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setQuickSelectedOptions([option])}
                                  className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                                    quickSelectedOptions.some((o) => o.id === option.id)
                                      ? 'border-pink-500 bg-pink-100'
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

                        {quickAddProduct.product_quantity_rules && quickAddProduct.product_quantity_rules.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-[#6b4c3b] mb-2">
                              Quantidade de Itens
                            </label>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => {
                                  const minQty = getMinQty(quickAddProduct.product_quantity_rules);
                                  if (quickQuantity > minQty) {
                                    setQuickQuantity(quickQuantity - 1);
                                  }
                                }}
                                className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 text-lg"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={getMinQty(quickAddProduct.product_quantity_rules)}
                                value={quickQuantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value);
                                  const minQty = getMinQty(quickAddProduct.product_quantity_rules);
                                  
                                  if (newQuantity < minQty) {
                                    toast.error(`Quantidade mínima é ${minQty} item${minQty > 1 ? 's' : ''}`);
                                    return;
                                  }
                                  
                                  const validation = validateQuantity(
                                    newQuantity,
                                    quickUnitQuantity,
                                    quickAddProduct.product_quantity_rules || []
                                  );
                                  if (!validation.isValid && validation.message) {
                                    toast.error(validation.message);
                                    return;
                                  }
                                  setQuickQuantity(newQuantity);
                                }}
                                className="w-20 px-3 py-2 text-center border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 text-lg"
                              />
                              <button
                                onClick={() => {
                                  const validation = validateQuantity(
                                    quickQuantity + 1,
                                    quickUnitQuantity,
                                    quickAddProduct.product_quantity_rules || []
                                  );
                                  if (validation.isValid) {
                                    setQuickQuantity(quickQuantity + 1);
                                  } else if (validation.message) {
                                    toast.error(validation.message);
                                  }
                                }}
                                className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 text-lg"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-[#6b4c3b] mb-2">
                            Quantidade de Unidades
                          </label>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                if (quickUnitQuantity > 1) {
                                  setQuickUnitQuantity(quickUnitQuantity - 1);
                                }
                              }}
                              className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 text-lg"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={quickUnitQuantity}
                              onChange={(e) => {
                                const newUnitQuantity = parseInt(e.target.value);
                                if (newUnitQuantity < 1) {
                                  toast.error("Quantidade mínima é 1 unidade");
                                  return;
                                }
                                const validation = validateQuantity(
                                  quickQuantity,
                                  newUnitQuantity,
                                  quickAddProduct.product_quantity_rules || []
                                );
                                if (!validation.isValid && validation.message) {
                                  toast.error(validation.message);
                                  return;
                                }
                                setQuickUnitQuantity(newUnitQuantity);
                              }}
                              className="w-20 px-3 py-2 text-center border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 text-lg"
                            />
                            <button
                              onClick={() => {
                                const validation = validateQuantity(
                                  quickQuantity,
                                  quickUnitQuantity + 1,
                                  quickAddProduct.product_quantity_rules || []
                                );
                                if (validation.isValid) {
                                  setQuickUnitQuantity(quickUnitQuantity + 1);
                                } else if (validation.message) {
                                  toast.error(validation.message);
                                }
                              }}
                              className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 text-lg"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Preço */}
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between text-sm">
                            <span>Total:</span>
                            <span className="font-medium text-primary-600">
                              R$ {calculateTotalPrice({
                                product_id: quickAddProduct.id,
                                quantity: quickQuantity,
                                unit_quantity: quickUnitQuantity,
                                selected_options: quickSelectedOptions,
                                unit_price: 0,
                                has_chocolate: false
                              }).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {quickAddProduct.has_chocolate_option && (
                          <div className="flex items-center space-x-2">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={items[items.length - 1]?.has_chocolate || false}
                                onChange={(e) => {
                                  const newItem = {
                                    product_id: quickAddProduct.id,
                                    quantity: quickQuantity,
                                    unit_price: quickAddProduct.price,
                                    has_chocolate: e.target.checked,
                                    unit_quantity: quickUnitQuantity,
                                    selected_options: quickSelectedOptions,
                                  };
                                  setItems([...items.slice(0, -1), newItem]);
                                }}
                                className="form-checkbox h-5 w-5 text-[#6b4c3b] border-pink-200 rounded focus:ring-[#6b4c3b]"
                              />
                              <span className="ml-2 text-base text-[#6b4c3b]">
                                Com chocolate
                              </span>
                            </label>
                          </div>
                        )}

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => {
                              setQuickAddProduct(null);
                              setQuickSelectedOptions([]);
                            }}
                            className="px-4 py-2 text-[#6b4c3b] border border-[#6b4c3b] rounded-lg hover:bg-[#6b4c3b] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6b4c3b] focus:ring-offset-2"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleQuickAdd}
                            className="px-4 py-2 bg-[#6b4c3b] text-white rounded-lg hover:bg-[#5a3d2e] focus:outline-none focus:ring-2 focus:ring-[#6b4c3b] focus:ring-offset-2"
                          >
                            Adicionar ao Pedido
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                              {product.product_quantity_rules && product.product_quantity_rules.length > 0 && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Quantidade de Unidades:</span>
                                    <button
                                      onClick={() =>
                                        handleQuantityChange(
                                          index,
                                          Math.max(1, item.quantity - 1)
                                        )
                                      }
                                      className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
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
                                      className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-600">Quantidade de Items:</span>
                                <button
                                  onClick={() =>
                                    handleUnitQuantityChange(
                                      index,
                                      Math.max(1, item.unit_quantity - 1)
                                    )
                                  }
                                  className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
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
                                  className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200"
                                >
                                  +
                                </button>
                              </div>
                              <div className="border-t border-gray-200 pt-3 mt-3">
                                <div className="flex justify-between text-sm">
                                  <span>Total:</span>
                                  <span className="font-medium text-primary-600">
                                    R$ {calculateTotalPrice(item).toFixed(2)}
                                  </span>
                                </div>
                              </div>
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
