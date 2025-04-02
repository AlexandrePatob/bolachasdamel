'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Order, OrderStatus } from "@/types/database";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import CreateOrderModal from "@/components/CreateOrderModal";
import { formatDate } from '@/lib/utils';

interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  orders_by_status: {
    pending: number;
    preparing: number;
    completed: number;
    shipped: number;
    delivered: number;
  };
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok) {
        throw new Error("Erro ao carregar dados");
      }
      const data = await response.json();
      setOrders(data.orders);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setStatusUpdateError(null);

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar status");
      }

      // Atualizar o pedido na lista local
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? data : order))
      );

      // Recarregar as estatísticas
      fetchDashboardData();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setStatusUpdateError(
        err instanceof Error ? err.message : "Erro ao atualizar status"
      );
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b4c3b]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar dados
            </h3>
            <div className="mt-1 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {statusUpdateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao atualizar status
              </h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{statusUpdateError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Criar Pedido */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#6b4c3b] text-white rounded-lg hover:bg-[#5a3d2e] focus:outline-none focus:ring-2 focus:ring-[#6b4c3b] focus:ring-offset-2 flex items-center space-x-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Criar Pedido</span>
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-pink-100"
        >
          <h3 className="text-sm font-medium text-[#6b4c3b]">Total de Pedidos</h3>
          <p className="mt-2 text-2xl font-bold text-[#6b4c3b]">
            {stats?.total_orders || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-pink-100"
        >
          <h3 className="text-sm font-medium text-[#6b4c3b]">Receita Total</h3>
          <p className="mt-2 text-2xl font-bold text-[#6b4c3b]">
            R$ {stats?.total_revenue.toFixed(2) || "0.00"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-pink-100"
        >
          <h3 className="text-sm font-medium text-[#6b4c3b]">Pendentes</h3>
          <p className="mt-2 text-2xl font-bold text-[#6b4c3b]">
            {stats?.orders_by_status.pending || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-pink-100"
        >
          <h3 className="text-sm font-medium text-[#6b4c3b]">Em Preparo</h3>
          <p className="mt-2 text-2xl font-bold text-[#6b4c3b]">
            {stats?.orders_by_status.preparing || 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-4 border border-pink-100"
        >
          <h3 className="text-sm font-medium text-[#6b4c3b]">Concluídos</h3>
          <p className="mt-2 text-2xl font-bold text-[#6b4c3b]">
            {stats?.orders_by_status.completed || 0}
          </p>
        </motion.div>
      </div>

      {/* Tabela de Pedidos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-pink-100">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b4c3b] uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b4c3b] uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b4c3b] uppercase tracking-wider">
                  Endereço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b4c3b] uppercase tracking-wider">
                  Itens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b4c3b] uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b4c3b] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6b4c3b] uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-pink-100">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => handleOrderClick(order)}
                  className="cursor-pointer hover:bg-pink-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#6b4c3b]">
                      {order.customer.name}
                    </div>
                    <div className="text-sm text-pink-600">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#6b4c3b]">
                      {order.delivery_address}
                    </div>
                    {order.customer?.complement && (
                      <div className="text-sm text-pink-600">
                        Complemento: {order.customer.complement}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.product.name}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#6b4c3b]">
                      R$ {order.total_amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-sm rounded-lg border-2 bg-white px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        order.status === 'pending' ? 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200' :
                        order.status === 'preparing' ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-200' :
                        order.status === 'completed' ? 'border-green-300 focus:border-green-500 focus:ring-green-200' :
                        order.status === 'shipped' ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-200' :
                        'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    >
                      <option value="pending" className="bg-yellow-50 text-yellow-800">Pendente</option>
                      <option value="preparing" className="bg-blue-50 text-blue-800">Em Preparo</option>
                      <option value="completed" className="bg-green-50 text-green-800">Concluído</option>
                      <option value="shipped" className="bg-purple-50 text-purple-800">Enviado</option>
                      <option value="delivered" className="bg-emerald-50 text-emerald-800">Entregue</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6b4c3b]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                        setIsDetailsModalOpen(true);
                      }}
                      className="text-pink-600 hover:text-pink-900"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal de Detalhes */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
      />

      {/* Modal de Criação */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={fetchDashboardData}
      />
    </div>
  );
} 