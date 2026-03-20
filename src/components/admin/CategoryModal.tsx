"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Category } from "@/types/database";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  category?: Category | null;
  nextSortOrder?: number;
}

const EMPTY_FORM = (nextSortOrder: number) => ({
  label: "",
  sort_order: nextSortOrder,
  is_featured: false,
  is_active: true,
});

export default function CategoryModal({
  isOpen,
  onClose,
  onSaved,
  category,
  nextSortOrder = 1,
}: CategoryModalProps) {
  const [form, setForm] = useState(EMPTY_FORM(nextSortOrder));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({
        label: category.label,
        sort_order: category.sort_order,
        is_featured: category.is_featured,
        is_active: category.is_active,
      });
    } else {
      setForm(EMPTY_FORM(nextSortOrder));
    }
  }, [category, nextSortOrder, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    setSaving(true);
    try {
      const url = category
        ? `/api/admin/categorias/${category.id}`
        : "/api/admin/categorias";
      const method = category ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Falha ao salvar categoria");

      toast.success(category ? "Categoria atualizada!" : "Categoria criada!");
      onSaved();
      onClose();
    } catch {
      toast.error("Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10"
          >
            <h2 className="text-xl font-bold text-[#6b4c3b] mb-5">
              {category ? "Editar Categoria" : "Nova Categoria"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Ex: Pascoa, Casamento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                  Ordem de exibição
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: Number(e.target.value) })
                  }
                  className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-[#6b4c3b]">Destaque</p>
                  <p className="text-xs text-gray-500">Exibir na seção de destaques</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.is_featured ? "bg-pink-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.is_featured ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-[#6b4c3b]">Ativa</p>
                  <p className="text-xs text-gray-500">Visível para os clientes</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.is_active ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.is_active ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-[#6b4c3b] text-white text-sm font-medium hover:bg-[#5a3d2e] transition-colors disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
