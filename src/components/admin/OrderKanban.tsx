"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  useDndContext,
} from "@dnd-kit/core";
import { Order, OrderStatus } from "@/types/database";

const STATUS_COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Pendente" },
  { status: "preparing", label: "Em Preparo" },
  { status: "completed", label: "Concluído" },
  { status: "shipped", label: "Enviado" },
  { status: "delivered", label: "Entregue" },
];

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isDeliveryOverdue(order: Order): boolean {
  if (order.status === "delivered") return false;
  if (!order.delivery_date) return false;
  const deliveryDate = new Date(order.delivery_date);
  const today = new Date();
  deliveryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return deliveryDate.getTime() <= today.getTime();
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "border-yellow-200 bg-yellow-50";
    case "preparing":
      return "border-blue-200 bg-blue-50";
    case "completed":
      return "border-green-200 bg-green-50";
    case "shipped":
      return "border-purple-200 bg-purple-50";
    case "delivered":
      return "border-emerald-200 bg-emerald-50";
    default:
      return "border-gray-200 bg-gray-50";
  }
}

interface OrderCardProps {
  order: Order;
  isNew: boolean;
  isOverdue: boolean;
  onOrderClick: (order: Order) => void;
  onShippingFeeEdit: (order: Order, e: React.MouseEvent) => void;
}

function OrderCard({
  order,
  isNew,
  isOverdue,
  onOrderClick,
  onShippingFeeEdit,
}: OrderCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: order.id,
  });
  const { active } = useDndContext();
  const isDragging = active?.id === order.id;

  const baseColor = isOverdue
    ? "border-red-400 bg-red-50 shadow-md ring-2 ring-red-300"
    : getStatusColor(order.status);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOrderClick(order)}
      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity ${baseColor} relative ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      {isOverdue && (
        <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full whitespace-nowrap animate-pulse">
          Entrega em atraso
        </span>
      )}
      {isNew && (
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-pink-500 text-white rounded-full">
          Novo
        </span>
      )}
      <div className="space-y-2">
        <div>
          <div className="text-sm font-medium text-[#6b4c3b]">
            {order.customer.name}
          </div>
          <div className="text-xs text-gray-500">{order.customer.phone}</div>
        </div>
        <div className="text-xs text-pink-600 truncate">{order.customer.email}</div>
        <div className="space-y-0.5">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="text-xs text-gray-600">
              {item.quantity}x
              {item.unit_quantity && item.unit_quantity > 1
                ? ` de ${item.unit_quantity}un`
                : ""}{" "}
              {item.product?.name}
              {item.options && item.options.length > 0 && (
                <>
                  {" "}
                  ({item.options.map((opt) => opt.option.name).join(", ")})
                </>
              )}
              {item.has_chocolate && " (Com chocolate)"}
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="text-xs text-gray-400">
              +{order.items.length - 2} mais
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#6b4c3b]">
              R$ {order.total_amount.toFixed(2)}
            </span>
            <button
              onClick={(e) => onShippingFeeEdit(order, e)}
              className="text-pink-600 hover:text-pink-700 p-0.5"
              title="Editar frete"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <span className="text-xs text-gray-400">
              + R$ {(order.shipping_fee ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
        <div className={`text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}`}>
          Entrega:{" "}
          {order.delivery_date
            ? new Date(order.delivery_date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            : "Não definida"}
          {isOverdue && " (vencida)"}
        </div>
      </div>
    </div>
  );
}

interface OrderKanbanProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onShippingFeeEdit: (order: Order) => void;
  statusUpdateError: string | null;
}

export default function OrderKanban({
  orders,
  onOrderClick,
  onStatusChange,
  onShippingFeeEdit,
  statusUpdateError,
}: OrderKanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const orderId = active.id as string;
    let newStatus: OrderStatus | null = null;
    if (STATUS_COLUMNS.some((c) => c.status === over.id)) {
      newStatus = over.id as OrderStatus;
    } else {
      const targetOrder = orders.find((o) => o.id === over.id);
      if (targetOrder) newStatus = targetOrder.status;
    }
    if (newStatus) {
      const order = orders.find((o) => o.id === orderId);
      if (order && order.status !== newStatus) {
        onStatusChange(orderId, newStatus);
      }
    }
  };

  const ordersByStatus = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.status] = orders.filter((o) => o.status === col.status);
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  return (
    <div className="space-y-4">
      {statusUpdateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {statusUpdateError}
        </div>
      )}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              orders={ordersByStatus[col.status] ?? []}
              onOrderClick={onOrderClick}
              onShippingFeeEdit={onShippingFeeEdit}
              isToday={isToday}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  orders,
  onOrderClick,
  onShippingFeeEdit,
  isToday,
}: {
  status: OrderStatus;
  label: string;
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onShippingFeeEdit: (order: Order) => void;
  isToday: (d: Date) => boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="bg-white/60 rounded-xl border border-pink-100 flex flex-col min-h-[320px]">
      <div className="px-4 py-3 border-b border-pink-100">
        <h3 className="text-sm font-medium text-[#6b4c3b]">{label}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-260px)] min-h-[120px] rounded-b-xl transition-colors ${isOver ? "bg-pink-50/50" : ""}`}
      >
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isNew={isToday(new Date(order.created_at))}
            isOverdue={isDeliveryOverdue(order)}
            onOrderClick={onOrderClick}
            onShippingFeeEdit={(o, e) => {
              e.stopPropagation();
              onShippingFeeEdit(o);
            }}
          />
        ))}
        {orders.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-pink-100 rounded-lg">
            Arraste pedidos aqui
          </div>
        )}
      </div>
    </div>
  );
}
