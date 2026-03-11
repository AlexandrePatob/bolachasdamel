"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/types/database";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import CreateOrderModal from "@/components/admin/CreateOrderModal";
import EditShippingFeeModal from "@/components/EditShippingFeeModal";
import OrderKanban from "@/components/admin/OrderKanban";

const DAYS_OPTIONS = [7, 15, 30, 60];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [periodTotal, setPeriodTotal] = useState(0);
  const [days, setDays] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderToEditShippingFee, setOrderToEditShippingFee] =
    useState<Order | null>(null);
  const [isEditShippingFeeModalOpen, setIsEditShippingFeeModalOpen] =
    useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [days]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard?days=${days}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      if (!response.ok) throw new Error("Erro ao carregar dados");
      const data = await response.json();
      setOrders(data.orders ?? []);
      setPeriodTotal(data.stats?.total_revenue ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      setStatusUpdateError(null);
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao atualizar status");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      setStatusUpdateError(
        err instanceof Error ? err.message : "Erro ao atualizar status"
      );
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  const handleShippingFeeEdit = (order: Order) => {
    setOrderToEditShippingFee(order);
    setIsEditShippingFeeModalOpen(true);
  };

  const handleShippingFeeUpdated = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  const handleOrderDeleted = () => {
    fetchDashboardData();
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b4c3b]" />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-800">Erro ao carregar</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="days-filter" className="text-sm text-gray-600">
            Pedidos dos últimos
          </label>
          <select
            id="days-filter"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-pink-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b4c3b] focus:border-[#6b4c3b]"
          >
            {DAYS_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} dias
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            ({orders.length} pedido{orders.length !== 1 ? "s" : ""})
          </span>
          <span className="text-sm font-semibold text-[#6b4c3b]">
            Total no período: R$ {periodTotal.toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#6b4c3b] text-white rounded-lg hover:bg-[#5a3d2e] focus:outline-none focus:ring-2 focus:ring-[#6b4c3b] focus:ring-offset-2 flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Criar Pedido
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b4c3b]" />
        </div>
      )}

      <OrderKanban
        orders={orders}
        onOrderClick={handleOrderClick}
        onStatusChange={handleStatusChange}
        onShippingFeeEdit={handleShippingFeeEdit}
        statusUpdateError={statusUpdateError}
      />

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        onOrderUpdated={handleOrderUpdated}
        onOrderDeleted={handleOrderDeleted}
      />

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={fetchDashboardData}
      />

      <EditShippingFeeModal
        order={orderToEditShippingFee}
        isOpen={isEditShippingFeeModalOpen}
        onClose={() => {
          setIsEditShippingFeeModalOpen(false);
          setOrderToEditShippingFee(null);
        }}
        onShippingFeeUpdated={handleShippingFeeUpdated}
      />
    </div>
  );
}
