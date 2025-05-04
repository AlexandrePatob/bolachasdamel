import { Order } from "@/types/database";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { validateQuantity } from "@/lib/quantityRules";

interface ProductOption {
  id: string;
  name: string;
  price_delta: number;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  has_chocolate: boolean;
  selected_options?: ProductOption[];
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    has_chocolate_option: boolean;
    product_quantity_rules: {
      id: string;
      min_qty: number;
      max_qty: number | null;
      price: number | null;
      extra_per_unit: number | null;
    }[];
  };
}

interface OrderDetailsModalProps {
  order: (Order & { items: OrderItem[] }) | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
  onOrderDeleted?: () => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
  onOrderDeleted,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const handleDelete = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir pedido");
      }

      toast.success("Pedido excluído com sucesso!");
      onOrderDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erro ao excluir pedido");
    }
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
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="px-6 py-4 border-b border-pink-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#6b4c3b]">
                    Detalhes do Pedido #{order.id.slice(0, 8)}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
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
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h3 className="text-lg font-medium text-[#6b4c3b] mb-4">
                    Informações do Cliente
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-pink-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Nome</p>
                        <p className="text-[#6b4c3b]">{order.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-[#6b4c3b]">{order.customer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telefone</p>
                        <p className="text-[#6b4c3b]">{order.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Endereço</p>
                        <p className="text-[#6b4c3b]">
                          {order.delivery_address}
                        </p>
                        {order.customer.complement && (
                          <p className="text-[#6b4c3b] mt-1">
                            Complemento: {order.customer.complement}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div>
                  <h3 className="text-lg font-medium text-[#6b4c3b] mb-4">
                    Itens do Pedido
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-4 bg-white border border-pink-100 rounded-lg p-4"
                      >
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-[#6b4c3b]">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-pink-600">
                            Quantidade: {item.quantity}
                          </p>
                          <p className="text-sm text-[#6b4c3b]">
                            Preço unitário: R$ {item.unit_price.toFixed(2)}
                          </p>
                          {item.product.has_chocolate_option && (
                            <p className="text-sm text-pink-600 mt-1">
                              {item.has_chocolate
                                ? "Com chocolate"
                                : "Sem chocolate"}
                            </p>
                          )}
                          {item.options && item.options.length > 0 && (
                            <div className="ml-4 text-xs text-pink-600 mt-1">
                              Opções:{" "}
                              {item.options
                                .map((opt) => opt.option.name)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium text-[#6b4c3b]">
                            R${" "}
                            {(() => {
                              const validation = validateQuantity(
                                item.quantity,
                                item.product.product_quantity_rules
                              );
                              const unitPrice =
                                validation.price || item.unit_price;
                              const optionsPrice =
                                (item as OrderItem).selected_options?.reduce(
                                  (sum: number, option: ProductOption) =>
                                    sum + option.price_delta,
                                  0
                                ) || 0;
                              const totalPrice =
                                unitPrice + optionsPrice * item.quantity;
                              return totalPrice.toFixed(2);
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo do Pedido */}
                <div>
                  <h3 className="text-lg font-medium text-[#6b4c3b] mb-4">
                    Resumo do Pedido
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-pink-100">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#6b4c3b]">Data do Pedido</span>
                        <span className="text-[#6b4c3b]">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b4c3b]">Data de Entrega</span>
                        <span className="text-[#6b4c3b]">
                          {order.delivery_date
                            ? formatDate(order.delivery_date)
                            : "Não definida"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b4c3b]">Frete</span>
                        <span className="text-[#6b4c3b]">
                          R$ {order.shipping_fee?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b4c3b]">Status</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "preparing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "shipped"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {order.status === "pending"
                            ? "Pendente"
                            : order.status === "preparing"
                            ? "Em Preparo"
                            : order.status === "completed"
                            ? "Concluído"
                            : order.status === "shipped"
                            ? "Enviado"
                            : "Entregue"}
                        </span>
                      </div>
                      {order.observations && (
                        <div className="mt-4">
                          <span className="text-sm text-gray-500">
                            Observações:
                          </span>
                          <p className="text-[#6b4c3b] mt-1">
                            {order.observations}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between mt-4 pt-4 border-t border-pink-100">
                        <span className="text-lg font-medium text-[#6b4c3b]">
                          Total
                        </span>
                        <span className="text-lg font-medium text-[#6b4c3b]">
                          R$ {order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
