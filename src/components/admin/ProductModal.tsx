"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Product, Category, ProductOptionInput, ProductQuantityRuleInput } from "@/types/database";
import { isFixedPackRules } from "@/lib/quantityRules";

type Tab = "basico" | "regras" | "opcoes";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: Product | null;
  categories: Category[];
}

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  has_chocolate_option: false,
  is_available: true,
  unit_quantity: 1,
};

export default function ProductModal({
  isOpen,
  onClose,
  onSaved,
  product,
  categories,
}: ProductModalProps) {
  const [tab, setTab] = useState<Tab>("basico");
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [options, setOptions] = useState<ProductOptionInput[]>([]);
  const [rules, setRules] = useState<ProductQuantityRuleInput[]>([]);
  const [rulesMode, setRulesMode] = useState<"fixed" | "tiered">("fixed");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        has_chocolate_option: product.has_chocolate_option,
        is_available: product.is_available,
        unit_quantity: product.unit_quantity,
      });
      setImagePreview(product.image || "");
      setImageFile(null);

      const productRules = product.product_quantity_rules || [];
      setRules(
        productRules.map((r) => ({
          min_qty: r.min_qty,
          max_qty: r.max_qty ?? undefined,
          price: r.price ?? undefined,
          extra_per_unit: r.extra_per_unit ?? undefined,
        }))
      );
      setRulesMode(
        productRules.length > 0 && isFixedPackRules(productRules as Parameters<typeof isFixedPackRules>[0])
          ? "fixed"
          : "tiered"
      );

      setOptions(
        (product.product_options || []).map((o) => ({
          type: o.type,
          name: o.name,
          price_delta: o.price_delta,
          image: o.image ?? undefined,
        }))
      );
    } else {
      setForm(EMPTY_PRODUCT);
      setImagePreview("");
      setImageFile(null);
      setRules([]);
      setOptions([]);
      setRulesMode("fixed");
    }
    setTab("basico");
  }, [product, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addRule = () => {
    if (rulesMode === "fixed") {
      setRules([...rules, { min_qty: 6, max_qty: 6, price: 0 }]);
    } else {
      setRules([...rules, { min_qty: 1, max_qty: null, price: 0, extra_per_unit: null }]);
    }
  };

  const updateRule = (i: number, field: keyof ProductQuantityRuleInput, value: unknown) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [field]: value === "" ? null : value };
    setRules(updated);
  };

  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));

  const addOption = () => {
    setOptions([...options, { type: "laco", name: "", price_delta: 0 }]);
  };

  const updateOption = (i: number, field: keyof ProductOptionInput, value: unknown) => {
    const updated = [...options];
    updated[i] = { ...updated[i], [field]: value };
    setOptions(updated);
  };

  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!form.category) { toast.error("Selecione uma categoria"); return; }

    setSaving(true);
    try {
      let imageUrl = form.image;
      let uploadedImageUrl: string | null = null;

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("fileName", imageFile.name);
        const uploadRes = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: fd,
        });
        if (!uploadRes.ok) throw new Error("Falha no upload da imagem");
        const { url: newUrl } = await uploadRes.json();
        imageUrl = newUrl;
        uploadedImageUrl = newUrl; // rastreia para rollback se o DB falhar
      }

      const isNew = !product;
      const payload = {
        ...form,
        image: imageUrl,
        options,
        quantity_rules: rules,
        // No PATCH, informa ao servidor qual URL nova foi gerada para reverter se necessário
        ...(uploadedImageUrl && !isNew ? { newImageUrl: uploadedImageUrl } : {}),
      };

      const url = product
        ? `/api/admin/produtos/${product.id}`
        : "/api/admin/produtos";
      const method = product ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao salvar produto");

      toast.success(product ? "Produto atualizado!" : "Produto criado!");
      onSaved();
      onClose();
    } catch {
      toast.error("Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const TAB_LABELS: { id: Tab; label: string }[] = [
    { id: "basico", label: "Dados Básicos" },
    { id: "regras", label: "Regras de Qtd." },
    { id: "opcoes", label: "Opções" },
  ];

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
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-pink-100">
              <h2 className="text-xl font-bold text-[#6b4c3b]">
                {product ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-3">
              {TAB_LABELS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t.id
                      ? "bg-[#6b4c3b] text-white"
                      : "text-[#6b4c3b] hover:bg-pink-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                {/* ── Aba: Dados Básicos ── */}
                {tab === "basico" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                          Nome *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                          Descrição
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          rows={2}
                          className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                          Preço base (R$)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                          className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                          Unidades por pacote
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={form.unit_quantity}
                          onChange={(e) =>
                            setForm({ ...form, unit_quantity: Number(e.target.value) })
                          }
                          className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-[#6b4c3b] mb-1">
                          Categoria *
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                        >
                          <option value="">Selecionar categoria...</option>
                          {categories
                            .filter((c) => c.is_active || c.id === form.category)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}{!c.is_active ? " (inativa)" : ""}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Imagem */}
                    <div>
                      <label className="block text-sm font-medium text-[#6b4c3b] mb-2">
                        Imagem
                      </label>
                      <div className="flex items-start gap-4">
                        <div
                          className="w-24 h-24 rounded-lg border-2 border-dashed border-pink-200 flex items-center justify-center cursor-pointer overflow-hidden bg-pink-50 hover:border-pink-400 transition-colors shrink-0"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? (
                            <Image
                              src={imagePreview}
                              alt="preview"
                              width={96}
                              height={96}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-xs text-gray-400 text-center px-1">
                              Clique para selecionar
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-[#6b4c3b] font-medium hover:underline"
                          >
                            {imagePreview ? "Trocar imagem" : "Selecionar imagem"}
                          </button>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG ou WEBP. Será enviado ao Storage.
                          </p>
                          {imageFile && (
                            <p className="text-xs text-green-600 mt-1">{imageFile.name}</p>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-t border-pink-50">
                        <div>
                          <p className="text-sm font-medium text-[#6b4c3b]">Opção de chocolate</p>
                          <p className="text-xs text-gray-500">Permite escolher chocolate</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm({ ...form, has_chocolate_option: !form.has_chocolate_option })
                          }
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            form.has_chocolate_option ? "bg-[#6b4c3b]" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              form.has_chocolate_option ? "translate-x-5" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-pink-50">
                        <div>
                          <p className="text-sm font-medium text-[#6b4c3b]">Disponível</p>
                          <p className="text-xs text-gray-500">Visível na loja</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm({ ...form, is_available: !form.is_available })
                          }
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            form.is_available ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              form.is_available ? "translate-x-5" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Aba: Regras de Quantidade ── */}
                {tab === "regras" && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setRulesMode("fixed"); setRules([]); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          rulesMode === "fixed"
                            ? "bg-[#6b4c3b] text-white border-[#6b4c3b]"
                            : "text-[#6b4c3b] border-pink-200 hover:bg-pink-50"
                        }`}
                      >
                        Packs Fixos
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRulesMode("tiered"); setRules([]); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          rulesMode === "tiered"
                            ? "bg-[#6b4c3b] text-white border-[#6b4c3b]"
                            : "text-[#6b4c3b] border-pink-200 hover:bg-pink-50"
                        }`}
                      >
                        Faixas de Preço
                      </button>
                    </div>

                    <p className="text-xs text-gray-500">
                      {rulesMode === "fixed"
                        ? "Packs com tamanho fixo (ex: pacote de 6 por R$13,90, pacote de 12 por R$27,90)."
                        : "Faixas de quantidade com preço variável (ex: 1-5 un. por R$5,00 cada)."}
                    </p>

                    {rules.length === 0 && (
                      <p className="text-center text-sm text-gray-400 py-4">
                        Nenhuma regra adicionada
                      </p>
                    )}

                    {rulesMode === "fixed" ? (
                      <div className="space-y-2">
                        {rules.map((rule, i) => (
                          <div key={i} className="flex items-center gap-2 bg-pink-50 rounded-lg p-3">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Unidades no pack</label>
                              <input
                                type="number"
                                min={1}
                                value={rule.min_qty}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  updateRule(i, "min_qty", v);
                                  updateRule(i, "max_qty", v);
                                }}
                                className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">Preço do pack (R$)</label>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={rule.price ?? ""}
                                onChange={(e) => updateRule(i, "price", Number(e.target.value))}
                                className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRule(i)}
                              className="text-red-400 hover:text-red-600 text-lg leading-none mt-4"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rules.map((rule, i) => (
                          <div key={i} className="bg-pink-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <label className="text-xs text-gray-500">Qtd. mínima</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={rule.min_qty}
                                  onChange={(e) => updateRule(i, "min_qty", Number(e.target.value))}
                                  className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs text-gray-500">Qtd. máxima</label>
                                <input
                                  type="number"
                                  min={1}
                                  value={rule.max_qty ?? ""}
                                  placeholder="sem limite"
                                  onChange={(e) =>
                                    updateRule(i, "max_qty", e.target.value ? Number(e.target.value) : null)
                                  }
                                  className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs text-gray-500">Preço (R$)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={rule.price ?? ""}
                                  onChange={(e) => updateRule(i, "price", Number(e.target.value))}
                                  className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs text-gray-500">Extra/unid. (R$)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={rule.extra_per_unit ?? ""}
                                  placeholder="—"
                                  onChange={(e) =>
                                    updateRule(
                                      i,
                                      "extra_per_unit",
                                      e.target.value ? Number(e.target.value) : null
                                    )
                                  }
                                  className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeRule(i)}
                                className="text-red-400 hover:text-red-600 text-lg leading-none mt-4"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addRule}
                      className="w-full py-2 rounded-lg border-2 border-dashed border-pink-300 text-sm text-[#6b4c3b] font-medium hover:bg-pink-50 transition-colors"
                    >
                      + Adicionar regra
                    </button>
                  </div>
                )}

                {/* ── Aba: Opções ── */}
                {tab === "opcoes" && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      Opções adicionais como laços e sabores. O preço pode ser positivo (acréscimo) ou
                      negativo (desconto).
                    </p>

                    {options.length === 0 && (
                      <p className="text-center text-sm text-gray-400 py-4">
                        Nenhuma opção adicionada
                      </p>
                    )}

                    {options.map((opt, i) => (
                      <div key={i} className="bg-pink-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-28 shrink-0">
                            <label className="text-xs text-gray-500">Tipo</label>
                            <select
                              value={opt.type}
                              onChange={(e) => updateOption(i, "type", e.target.value)}
                              className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5 bg-white"
                            >
                              <option value="laco">Laço</option>
                              <option value="sabor">Sabor</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-500">Nome</label>
                            <input
                              type="text"
                              value={opt.name}
                              onChange={(e) => updateOption(i, "name", e.target.value)}
                              placeholder="Ex: Laço Dourado"
                              className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                            />
                          </div>
                          <div className="w-28 shrink-0">
                            <label className="text-xs text-gray-500">Variação (R$)</label>
                            <input
                              type="number"
                              step={0.01}
                              value={opt.price_delta}
                              onChange={(e) =>
                                updateOption(i, "price_delta", Number(e.target.value))
                              }
                              className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="text-red-400 hover:text-red-600 text-lg leading-none mt-5"
                          >
                            ×
                          </button>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">URL da imagem (opcional)</label>
                          <input
                            type="text"
                            value={opt.image ?? ""}
                            onChange={(e) =>
                              updateOption(i, "image", e.target.value || null)
                            }
                            placeholder="https://..."
                            className="w-full border border-pink-200 rounded px-2 py-1 text-sm mt-0.5"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addOption}
                      className="w-full py-2 rounded-lg border-2 border-dashed border-pink-300 text-sm text-[#6b4c3b] font-medium hover:bg-pink-50 transition-colors"
                    >
                      + Adicionar opção
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-pink-100">
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
                  {saving ? "Salvando..." : "Salvar produto"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
