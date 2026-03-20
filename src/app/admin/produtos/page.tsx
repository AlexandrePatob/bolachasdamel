"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { Product, Category } from "@/types/database";
import ProductModal from "@/components/admin/ProductModal";

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/produtos"),
        fetch("/api/admin/categorias"),
      ]);
      const [prods, cats] = await Promise.all([prodRes.json(), catRes.json()]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleAvailability = async (product: Product) => {
    const newState = !product.is_available;
    try {
      const res = await fetch(`/api/admin/produtos/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: newState }),
      });
      if (!res.ok) throw new Error();
      toast.success(newState ? "Produto disponibilizado!" : "Produto desativado!");
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_available: newState } : p))
      );
    } catch {
      toast.error("Erro ao alterar disponibilidade");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const filteredProducts =
    activeCategory === "todas"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // IDs únicos das categorias usadas nos produtos
  const usedCategoryIds = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  // Mapeia id → label usando a tabela de categorias (fallback para o próprio id)
  const getCategoryLabel = (id: string) =>
    categories.find((c) => c.id === id)?.label ?? id;

  return (
    <div className="py-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#6b4c3b]">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} produtos cadastrados
          </p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setModalOpen(true); }}
          className="px-4 py-2 bg-[#6b4c3b] text-white text-sm font-medium rounded-lg hover:bg-[#5a3d2e] transition-colors"
        >
          + Novo Produto
        </button>
      </div>

      {/* Filtro por categoria */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory("todas")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === "todas"
              ? "bg-[#6b4c3b] text-white"
              : "text-[#6b4c3b] bg-white border border-pink-200 hover:bg-pink-50"
          }`}
        >
          Todas
        </button>
        {usedCategoryIds.map((catId) => (
          <button
            key={catId}
            onClick={() => setActiveCategory(catId)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === catId
                ? "bg-[#6b4c3b] text-white"
                : "text-[#6b4c3b] bg-white border border-pink-200 hover:bg-pink-50"
            }`}
          >
            {getCategoryLabel(catId)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          Nenhum produto encontrado
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryLabel={getCategoryLabel(product.category)}
              onEdit={handleEdit}
              onToggle={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchData}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
}

function ProductCard({
  product,
  categoryLabel,
  onEdit,
  onToggle,
}: {
  product: Product;
  categoryLabel: string;
  onEdit: (p: Product) => void;
  onToggle: (p: Product) => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition-opacity ${
        !product.is_available ? "opacity-60 border-gray-200" : "border-pink-100"
      }`}
    >
      {/* Imagem */}
      <div className="relative w-full aspect-square bg-pink-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-3xl">
            🍪
          </div>
        )}
        {/* Badge disponibilidade */}
        <div
          className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${
            product.is_available
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {product.is_available ? "Ativo" : "Inativo"}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div>
          <p className="text-sm font-semibold text-[#6b4c3b] line-clamp-2 leading-tight">
            {product.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{categoryLabel}</p>
        </div>
        <p className="text-sm font-bold text-[#6b4c3b] mt-auto">
          R$ {product.price.toFixed(2).replace(".", ",")}
        </p>

        {/* Ações */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-pink-50 text-[#6b4c3b] hover:bg-pink-100 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onToggle(product)}
            title={product.is_available ? "Desativar produto" : "Reativar produto"}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              product.is_available
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
          >
            {product.is_available ? "✕" : "✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
