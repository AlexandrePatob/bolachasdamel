"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/types/database";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import EditShippingFeeModal from "@/components/EditShippingFeeModal";
import OrderKanban from "@/components/admin/OrderKanban";

export default function AdminHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [orderToEditShippingFee, setOrderToEditShippingFee] =
    useState<Order | null>(null);
  const [isEditShippingFeeModalOpen, setIsEditShippingFeeModalOpen] =
    useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard?all=true", {
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
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b4c3b]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-800">Erro ao carregar</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#6b4c3b]">
          Histórico - Todos os pedidos
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} no total
        </p>
      </div>
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
