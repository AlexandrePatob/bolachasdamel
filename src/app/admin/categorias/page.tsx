"use client";

import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Category } from "@/types/database";
import CategoryModal from "@/components/admin/CategoryModal";

function SortableCategoryCard({
  category,
  onEdit,
  onToggle,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onToggle: (c: Category) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white rounded-xl border p-4 shadow-sm ${
        !category.is_active ? "opacity-60 border-gray-200" : "border-pink-100"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing text-xl leading-none select-none"
        title="Arrastar para reordenar"
      >
        ⠿
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#6b4c3b] capitalize">{category.label}</span>
          {category.is_featured && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              Destaque
            </span>
          )}
          {!category.is_active && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Inativa
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Ordem: {category.sort_order}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(category)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#6b4c3b] bg-pink-50 hover:bg-pink-100 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onToggle(category)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            category.is_active
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-green-700 bg-green-50 hover:bg-green-100"
          }`}
        >
          {category.is_active ? "Desativar" : "Reativar"}
        </button>
      </div>
    </div>
  );
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categorias");
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex).map((cat, idx) => ({
      ...cat,
      sort_order: idx + 1,
    }));

    setCategories(reordered);
    setSaving(true);

    try {
      await Promise.all(
        reordered.map((cat) =>
          fetch(`/api/admin/categorias/${cat.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sort_order: cat.sort_order }),
          })
        )
      );
      toast.success("Ordem salva!");
    } catch {
      toast.error("Erro ao salvar ordem");
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleToggle = async (category: Category) => {
    const newState = !category.is_active;
    try {
      const res = await fetch(`/api/admin/categorias/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newState }),
      });
      if (!res.ok) throw new Error();
      toast.success(newState ? "Categoria reativada!" : "Categoria desativada!");
      fetchCategories();
    } catch {
      toast.error("Erro ao alterar categoria");
    }
  };

  const nextSortOrder = categories.length > 0
    ? Math.max(...categories.map((c) => c.sort_order)) + 1
    : 1;

  return (
    <div className="py-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#6b4c3b]">Categorias</h1>
          <p className="text-sm text-gray-500 mt-1">
            Arraste para reordenar. {saving && "Salvando..."}
          </p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setModalOpen(true); }}
          className="px-4 py-2 bg-[#6b4c3b] text-white text-sm font-medium rounded-lg hover:bg-[#5a3d2e] transition-colors"
        >
          + Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          Nenhuma categoria cadastrada
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 max-w-2xl">
              {categories.map((cat) => (
                <SortableCategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchCategories}
        category={editingCategory}
        nextSortOrder={nextSortOrder}
      />
    </div>
  );
}
